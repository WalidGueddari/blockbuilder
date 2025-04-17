-- DropForeignKey
ALTER TABLE "Network" DROP CONSTRAINT "Network_serverId_fkey";

-- AlterTable
ALTER TABLE "Network" ALTER COLUMN "serverId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Network" ADD CONSTRAINT "Network_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "VmServer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
