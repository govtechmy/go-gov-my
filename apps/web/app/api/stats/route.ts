import { handleAndReturnErrorResponse } from '@/lib/api/errors';
import { prisma } from '@/lib/prisma';
import { storage } from '@/lib/storage';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type metaDataType = { date: string; total: string | number };

function sortByDateAsc(metadata: metaDataType[]): metaDataType[] {
  return metadata.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}

function fillData(metaData: metaDataType[], newData: metaDataType) {
  const lastDateBeforeNew = metaData[metaData.length - 1].date;
  const daysDifference: number = getDaysDifference(
    lastDateBeforeNew,
    newData.date,
  );
  if (daysDifference > 1) {
    for (let i = 1; i < daysDifference; i++) {
      const tempData = JSON.parse(JSON.stringify(newData)); // deep clone
      tempData.date = addDay(lastDateBeforeNew, i);
      metaData.push(tempData);
    }
  }

  metaData.push(newData); // modify in place
}

function addDay(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function getDaysDifference(dateString1: string, dateString2: string): number {
  const date1 = new Date(dateString1);
  const date2 = new Date(dateString2);

  const timeDifference = Math.abs(date2.getTime() - date1.getTime());

  const millisecondsInDay = 1000 * 60 * 60 * 24;
  const daysDifference = timeDifference / millisecondsInDay;

  return Math.floor(daysDifference);
}

const metadataItemSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }), // Validate ISO date string
  total: z.string().transform(Number),
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
    // console.log('Parsed data:', parsed);
    // console.log("parsed", parsed)

    const clicksMetadataSorted = sortByDateAsc(parsed.clicksMetadata);
    const linksMetadata = sortByDateAsc(parsed.clicksMetadata);
    const officersMetadata = sortByDateAsc(parsed.clicksMetadata);
    fillData(clicksMetadataSorted, {
      date: new Date().toISOString(),
      total: totalClicks._sum.clicks || 0,
    });
    fillData(linksMetadata, {
      date: new Date().toISOString(),
      total: linkCount || 0,
    });
    fillData(officersMetadata, {
      date: new Date().toISOString(),
      total: userCount || 0,
    });

    const obj = {
      clicksMetadata: clicksMetadataSorted,
      linksMetadata: linksMetadata,
      officersMetadata: officersMetadata,
    };

    const buf = Buffer.from(JSON.stringify(obj));
    const { url } = await storage.upload('public/stats2.json', buf);
    console.log('url', url);

    return NextResponse.json({
      url,
    });
  } catch (error) {
    return handleAndReturnErrorResponse(error);
  }
}
