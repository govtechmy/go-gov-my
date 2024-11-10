/*
  Warnings:

  - Added the required column `ipAddress` to the `ReportedLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userAgent` to the `ReportedLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReportedLink" ADD COLUMN     "ipAddress" TEXT NOT NULL,
ADD COLUMN     "userAgent" TEXT NOT NULL;
