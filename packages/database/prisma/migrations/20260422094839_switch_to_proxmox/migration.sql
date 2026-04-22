/*
  Warnings:

  - You are about to drop the column `azureId` on the `VmServer` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `VmServer` table. All the data in the column will be lost.
  - You are about to drop the column `resourceGroup` on the `VmServer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VmServer" DROP COLUMN "azureId",
DROP COLUMN "location",
DROP COLUMN "resourceGroup",
ADD COLUMN     "proxmoxNode" TEXT,
ADD COLUMN     "proxmoxVmId" TEXT,
ALTER COLUMN "macAddress" DROP NOT NULL,
ALTER COLUMN "powerState" DROP NOT NULL,
ALTER COLUMN "privateIpAddress" DROP NOT NULL;
