/*
  Warnings:

  - Added the required column `sshKeyName` to the `VmServer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VmServer" ADD COLUMN     "sshKeyName" TEXT NOT NULL;
