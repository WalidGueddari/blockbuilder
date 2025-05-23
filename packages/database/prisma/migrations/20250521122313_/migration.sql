-- AlterTable
ALTER TABLE "User" ADD COLUMN     "code" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false;
