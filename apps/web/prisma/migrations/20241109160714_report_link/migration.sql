-- CreateTable
CREATE TABLE "ReportedLink" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportedLink_pkey" PRIMARY KEY ("id")
);
