/*
  Warnings:

  - Added the required column `transactionHash` to the `DeployedContract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeployedContract" ADD COLUMN     "transactionHash" TEXT NOT NULL;
