-- CreateTable
CREATE TABLE "Genesis" (
    "id" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "berlinBlock" INTEGER NOT NULL DEFAULT 0,
    "blockPeriod" INTEGER NOT NULL DEFAULT 2,
    "epochLength" INTEGER NOT NULL DEFAULT 30000,
    "requestTimeout" INTEGER NOT NULL DEFAULT 4,
    "nonce" TEXT NOT NULL DEFAULT '0x0',
    "timestamp" TEXT NOT NULL,
    "gasLimit" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "mixHash" TEXT NOT NULL,
    "coinbase" TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Genesis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genesis_networkId_key" ON "Genesis"("networkId");

-- AddForeignKey
ALTER TABLE "Genesis" ADD CONSTRAINT "Genesis_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
