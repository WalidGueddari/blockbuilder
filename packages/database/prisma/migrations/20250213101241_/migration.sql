/*
  Warnings:

  - The primary key for the `VmServer` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `serverId` to the `Network` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `VmServer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Network" ADD COLUMN     "serverId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "VmServer" DROP CONSTRAINT "VmServer_pkey",
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "VmServer_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "VmServer_id_seq";

-- AddForeignKey
ALTER TABLE "Network" ADD CONSTRAINT "Network_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "VmServer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VmServer" ADD CONSTRAINT "VmServer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
