import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type metaDataType = { date: string; total: number };

function normalizeDate(date: string): string {
  return new Date(date).toISOString().split('T')[0];
}

function sortByDateAsc(metadata: metaDataType[]): metaDataType[] {
  const uniqueData = new Map<string, number>();

  metadata.forEach((item) => {
    const normalizedDate = normalizeDate(item.date);
    if (uniqueData.has(normalizedDate)) {
      uniqueData.set(
        normalizedDate,
        Math.max(uniqueData.get(normalizedDate)!, item.total),
      );
    } else {
      uniqueData.set(normalizedDate, item.total);
    }
  });

  return Array.from(uniqueData.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function getDaysDifference(dateString1: string, dateString2: string): number {
  const date1 = new Date(normalizeDate(dateString1));
  const date2 = new Date(normalizeDate(dateString2));

  const timeDifference = date2.getTime() - date1.getTime();
  const millisecondsInDay = 1000 * 60 * 60 * 24;

  return Math.floor(timeDifference / millisecondsInDay);
}

function addDays(dateString: string, days: number): string {
  const date = new Date(normalizeDate(dateString));
  date.setDate(date.getDate() + days);
  return normalizeDate(date.toISOString());
}

function fillData(metaData: metaDataType[], newData: metaDataType) {
  if (metaData.length === 0) {
    metaData.push({
      date: normalizeDate(newData.date),
      total: newData.total,
    });
    return;
  }

  const lastEntry = metaData[metaData.length - 1];
  const normalizedNewDate = normalizeDate(newData.date);
  const daysDifference = getDaysDifference(lastEntry.date, normalizedNewDate);

  if (daysDifference > 0) {
    for (let i = 1; i < daysDifference; i++) {
      const interpolatedDate = addDays(lastEntry.date, i);
      metaData.push({
        date: interpolatedDate,
        total: lastEntry.total,
      });
    }

    metaData.push({
      date: normalizedNewDate,
      total: newData.total,
    });
  }
}

const metadataItemSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }), // Validate ISO date string
  total: z.number(), // Change from string to number
});

const schema = z.object({
  clicksMetadata: z.array(metadataItemSchema),
  linksMetadata: z.array(metadataItemSchema),
  officersMetadata: z.array(metadataItemSchema),
});

export async function GET(req: NextRequest) {
  try {
    // Check if api correct, prevent outsiders from scraping
    const api_key = req.headers.get('API_KEY');
    if (api_key !== process.env.API_KEY) {
      return NextResponse.json({
        message: 'WRONG API KEY',
      });
    }

    const userCount = await prisma.user.count();

    const linkCount = await prisma.link.count();

    const totalClicks = await prisma.link.aggregate({
      _sum: {
        clicks: true,
      },
    });

    const response = await fetch(
      `${process.env.STORAGE_BASE_URL}/public/stats2.json`,
    );
    const content = await response.json();

    const parsed = schema.parse(content);

    const clicksMetadataSorted = sortByDateAsc(parsed.clicksMetadata);
    const linksMetadataSorted = sortByDateAsc(parsed.linksMetadata);
    const officersMetadataSorted = sortByDateAsc(parsed.officersMetadata);
    fillData(clicksMetadataSorted, {
      date: new Date().toISOString(),
      total: totalClicks._sum.clicks || 0,
    });
    fillData(linksMetadataSorted, {
      date: new Date().toISOString(),
      total: linkCount || 0,
    });
    fillData(officersMetadataSorted, {
      date: new Date().toISOString(),
      total: userCount || 0,
    });

    const obj = {
      clicksMetadata: clicksMetadataSorted,
      linksMetadata: linksMetadataSorted,
      officersMetadata: officersMetadataSorted,
    };

    const buf = Buffer.from(JSON.stringify(obj));
    const { url } = await storage.upload('public/stats2.json', buf, {
      contentType: 'application/json',
    });

    return NextResponse.json({
      url,
    });
  } catch (error) {
    console.log('error', error);
    return handleAndReturnErrorResponse(error);
  }
}
