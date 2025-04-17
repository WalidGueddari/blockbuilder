-- AlterTable
ALTER TABLE "Network" ADD COLUMN     "blockscoutServerId" TEXT;

-- AddForeignKey
ALTER TABLE "Network" ADD CONSTRAINT "Network_blockscoutServerId_fkey" FOREIGN KEY ("blockscoutServerId") REFERENCES "VmServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
