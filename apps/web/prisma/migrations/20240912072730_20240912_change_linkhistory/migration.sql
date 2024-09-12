/*
  Warnings:

  - You are about to drop the column `password` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `rewrite` on the `Link` table. All the data in the column will be lost.
  - You are about to drop the column `domainsLimit` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `usersLimit` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Domain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jackson_index` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jackson_store` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `jackson_ttl` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `projectId` on table `Link` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('staff', 'agency_admin', 'super_admin');

-- CreateEnum
CREATE TYPE "LinkHistoryType" AS ENUM ('create', 'update');

-- DropIndex
DROP INDEX "Link_password_idx";

-- DropIndex
DROP INDEX "ProjectInvite_email_projectId_key";

-- DropIndex
DROP INDEX "VerificationToken_identifier_token_key";

-- AlterTable
ALTER TABLE "Link" DROP COLUMN "password",
DROP COLUMN "rewrite",
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordEnabledAt" TIMESTAMP(3),
ALTER COLUMN "projectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "domainsLimit",
DROP COLUMN "usersLimit",
ADD COLUMN     "agencyCode" TEXT NOT NULL DEFAULT 'govtech';

-- AlterTable
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_pkey" PRIMARY KEY ("email", "projectId");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "agencyCode" TEXT NOT NULL DEFAULT 'govtech',
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'staff';

-- AlterTable
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token");

-- DropTable
DROP TABLE "Domain";

-- DropTable
DROP TABLE "jackson_index";

-- DropTable
DROP TABLE "jackson_store";

-- DropTable
DROP TABLE "jackson_ttl";

-- CreateTable
CREATE TABLE "Agency" (
    "code" TEXT NOT NULL,
    "logo" TEXT,
    "names" JSONB NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "WebhookOutbox" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "host" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "headers" JSONB NOT NULL,
    "partitionKey" TEXT NOT NULL,
    "encryptedSecrets" TEXT,

    CONSTRAINT "WebhookOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" "LinkHistoryType" NOT NULL,
    "committedByUserId" UUID,
    "linkId" UUID NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "domain" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "expiredUrl" TEXT,
    "externalId" TEXT,
    "trackConversion" BOOLEAN NOT NULL,
    "publicStats" BOOLEAN NOT NULL,
    "proxy" BOOLEAN NOT NULL,
    "title" TEXT,
    "description" VARCHAR(280),
    "image" TEXT,
    "ios" TEXT,
    "android" TEXT,
    "geo" JSON,

    CONSTRAINT "LinkHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "linkId" TEXT NOT NULL,
    "from" TIMESTAMP(3) NOT NULL,
    "to" TIMESTAMP(3) NOT NULL,
    "aggregatedDate" DATE NOT NULL,
    "metadata" JSON NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotentResource" (
    "idempotencyKey" TEXT NOT NULL,
    "hashedPayload" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotentResource_pkey" PRIMARY KEY ("idempotencyKey")
);

-- CreateIndex
CREATE INDEX "LinkHistory_linkId_idx" ON "LinkHistory"("linkId");

-- CreateIndex
CREATE INDEX "DefaultDomains_projectId_idx" ON "DefaultDomains"("projectId");

-- CreateIndex
CREATE INDEX "User_agencyCode_idx" ON "User"("agencyCode");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_agencyCode_fkey" FOREIGN KEY ("agencyCode") REFERENCES "Agency"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectInvite" ADD CONSTRAINT "ProjectInvite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefaultDomains" ADD CONSTRAINT "DefaultDomains_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUsers" ADD CONSTRAINT "ProjectUsers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUsers" ADD CONSTRAINT "ProjectUsers_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentEmail" ADD CONSTRAINT "SentEmail_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Link" ADD CONSTRAINT "Link_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkHistory" ADD CONSTRAINT "LinkHistory_committedByUserId_fkey" FOREIGN KEY ("committedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkHistory" ADD CONSTRAINT "LinkHistory_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTag" ADD CONSTRAINT "LinkTag_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkTag" ADD CONSTRAINT "LinkTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
