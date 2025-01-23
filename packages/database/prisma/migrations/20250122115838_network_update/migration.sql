/*
  Warnings:

  - Added the required column `nodeCount` to the `Network` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Network" ADD COLUMN     "nodeCount" INTEGER NOT NULL;
