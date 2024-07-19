import { prisma } from "@/lib/prisma";

const data = {
  shortDate: "2024-07-17",
  from: "2024-07-17T13:11:39+08:00",
  to: "2024-07-17T13:51:04.455631+08:00",
  linkAnalytics: [
    {
      linkId: "823044fc-a18f-448a-99c4-1b67f0640fd9",
      total: 3235,
      countryCode: {
        MY: 3235,
        TH: {},
      },
      deviceType: {
        desktop: 1578,
        mobile: 1657,
      },
      browser: {
        chrome: 633,
        edge: 662,
        firefox: 660,
        internet_explorer: 633,
        opera: 647,
      },
      operatingSystem: {
        android: 822,
        ios: 835,
        linux: 564,
        macos: 522,
        windows: 492,
      },
      referer: {
        "https://facebook.com": 1084,
        "https://twitter.com": 1034,
        "https://x.com": 1117,
      },
    },
    {
      linkId: "b9152968-bf44-4dbc-b545-333b5d0ee9ea",
      total: 3438,
      countryCode: {
        MY: 3438,
      },
      deviceType: {
        desktop: 1767,
        mobile: 1671,
      },
      browser: {
        chrome: 672,
        edge: 656,
        firefox: 682,
        internet_explorer: 752,
        opera: 676,
      },
      operatingSystem: {
        android: 864,
        ios: 807,
        linux: 528,
        macos: 651,
        windows: 588,
      },
      referer: {
        "https://facebook.com": 1116,
        "https://twitter.com": 1121,
        "https://x.com": 1201,
      },
    },
  ],
};

type KafkaData = {
  shortDate: Date;
  from: Date;
  to: Date;
  linkAnalytics: AnalyticsType[];
};

interface AnalyticsType {
  linkId: String;
  total: Number;
  countryCode: {
    [key: string]: string | number;
  };
  deviceType: {
    [key: string]: string | number;
  };
  browser: {
    [key: string]: string | number;
  };
  operatingSystem: {
    [key: string]: string | number;
  };
  referer: {
    [key: string]: string | number;
  };
}

function consumeAnalytics(
  link: AnalyticsType,
  shortDate: Date,
  from: Date,
  to: Date,
) {
  const dataObject = JSON.parse(JSON.stringify(link)); // deep clone
  delete dataObject?.linkId;
  return {
    shortDate: new Date(shortDate),
    linkId: link?.linkId,
    from: from,
    to: to,
    metadata: dataObject,
  };
}

function sumTwoObj(obj1: AnalyticsType, obj2: AnalyticsType) {
  const clone = {};
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      clone[key] = obj1[key];
    }
  }
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (typeof obj2[key] === "number") {
        if (clone.hasOwnProperty(key)) {
          clone[key] += obj2[key];
        } else {
          clone[key] = obj2[key];
        }
      } else if (typeof obj2[key] === "object") {
        clone[key] = sumTwoObj(obj2[key], clone[key]);
      }
    }
  }
  return clone;
}

async function main(data) {
  const message = {
    value: data,
  };
  const shortDate = message?.value?.shortDate;
  const from = message?.value?.from;
  const to = message?.value?.to;

  message?.value?.linkAnalytics?.forEach(async (link) => {
    const row = await prisma.analytics.findMany({
      where: {
        AND: [
          {
            shortDate: new Date(shortDate),
          },
          {
            linkId: {
              equals: link?.linkId,
            },
          },
        ],
      },
      take: 1,
    });
    console.log("row", row);
    if (row.length > 0) {
      console.log("append row");
      const metaData = row[0]?.metadata;
      console.log("metaData", metaData);
      const combine = sumTwoObj(
        metaData,
        consumeAnalytics(link, shortDate, from, to)?.metadata,
      );
      console.log("combine", combine);
      try {
        await prisma.analytics.update({
          where: {
            id: row[0].id,
          },
          data: {
            metadata: combine,
            from: from,
            to: to,
          },
        });
      } catch (error) {
        console.log("error", error);
      }
    } else {
      console.log("row not found, insert now");
      // INSERT FRESH ROW
      try {
        await prisma.analytics.create({
          data: consumeAnalytics(link, shortDate, from, to),
        });
      } catch (error) {
        console.log("error", error);
      }
    }
  });
}

main(data);
