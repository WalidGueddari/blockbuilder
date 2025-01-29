/*
  Warnings:

  - Added the required column `enodeUrl` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodeIndex` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nodeIp` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p2pHost` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `p2pPort` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rpcHttpHost` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rpcHttpPort` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rpcWsHost` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rpcWsPort` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wsHost` to the `Node` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "enodeUrl" TEXT NOT NULL,
ADD COLUMN     "nodeIndex" INTEGER NOT NULL,
ADD COLUMN     "nodeIp" TEXT NOT NULL,
ADD COLUMN     "p2pHost" TEXT NOT NULL,
ADD COLUMN     "p2pPort" INTEGER NOT NULL,
ADD COLUMN     "rpcHttpHost" TEXT NOT NULL,
ADD COLUMN     "rpcHttpPort" INTEGER NOT NULL,
ADD COLUMN     "rpcWsHost" TEXT NOT NULL,
ADD COLUMN     "rpcWsPort" INTEGER NOT NULL,
ADD COLUMN     "wsHost" TEXT NOT NULL;
