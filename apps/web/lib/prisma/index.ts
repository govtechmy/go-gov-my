// // import { PrismaClient } from "@prisma/client";

// // // serverless prisma
// // export const prisma = new PrismaClient();

// // declare global {
// //   var prisma: PrismaClient | undefined;
// // }

// // if (process.env.NODE_ENV === "development") global.prisma = prisma;

import { PrismaClient } from "@prisma/client/edge";

export const prisma = new PrismaClient();

// import { Client } from "@planetscale/database";
// import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
// import { PrismaClient } from "@prisma/client";

// const client = new Client({ url: process.env.DATABASE_URL });

// const adapter = new PrismaPlanetScale(client);

// export const prisma = new PrismaClient({
//   adapter,
// });
