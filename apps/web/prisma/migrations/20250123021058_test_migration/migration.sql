-- CreateTable
CREATE TABLE "TestTable" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,

    CONSTRAINT "TestTable_pkey" PRIMARY KEY ("id")
);
