-- CreateTable
CREATE TABLE "CorporateClient" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "corporateData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CorporateAd" (
    "id" SERIAL NOT NULL,
    "corporateClientId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CorporateAd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CorporateClient_userId_key" ON "CorporateClient"("userId");

-- AddForeignKey
ALTER TABLE "CorporateClient" ADD CONSTRAINT "CorporateClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CorporateAd" ADD CONSTRAINT "CorporateAd_corporateClientId_fkey" FOREIGN KEY ("corporateClientId") REFERENCES "CorporateClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
