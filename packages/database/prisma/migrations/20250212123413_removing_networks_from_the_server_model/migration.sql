/*
  Warnings:

  - You are about to drop the column `networkId` on the `Server` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Server" DROP CONSTRAINT "Server_networkId_fkey";

-- AlterTable
ALTER TABLE "Server" DROP COLUMN "networkId";
