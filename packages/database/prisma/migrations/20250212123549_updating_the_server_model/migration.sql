/*
  Warnings:

  - You are about to drop the `Server` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Server";

-- DropEnum
DROP TYPE "ServerStatus";

-- CreateTable
CREATE TABLE "VmServer" (
    "id" SERIAL NOT NULL,
    "azureId" TEXT NOT NULL,
    "adminUsername" TEXT NOT NULL,
    "vmName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "macAddress" TEXT NOT NULL,
    "powerState" TEXT NOT NULL,
    "privateIpAddress" TEXT NOT NULL,
    "publicIpAddress" TEXT NOT NULL,
    "resourceGroup" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VmServer_pkey" PRIMARY KEY ("id")
);
