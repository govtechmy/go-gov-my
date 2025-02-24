/*
  Warnings:

  - You are about to drop the `TestTable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "TestTable";

-- CreateTable
CREATE TABLE "AllowedDomains" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "AllowedDomains_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedDomains_domain_key" ON "AllowedDomains"("domain");
