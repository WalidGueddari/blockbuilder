/*
  Warnings:

  - You are about to drop the column `chainId` on the `Genesis` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Genesis" DROP COLUMN "chainId";
