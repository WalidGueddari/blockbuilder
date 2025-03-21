-- CreateTable
CREATE TABLE "Alloc" (
    "id" TEXT NOT NULL,
    "public_address" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "balance" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alloc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Alloc" ADD CONSTRAINT "Alloc_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
