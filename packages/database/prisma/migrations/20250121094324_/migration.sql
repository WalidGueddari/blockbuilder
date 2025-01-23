/*
  Warnings:

  - You are about to drop the column `consensus` on the `Network` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Network` table. All the data in the column will be lost.
  - You are about to drop the column `nodeCount` on the `Network` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Network" DROP COLUMN "consensus",
DROP COLUMN "description",
DROP COLUMN "nodeCount",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'QBFT';

-- AlterTable
ALTER TABLE "Node" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
