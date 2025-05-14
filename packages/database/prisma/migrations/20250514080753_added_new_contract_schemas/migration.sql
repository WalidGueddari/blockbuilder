-- CreateTable
CREATE TABLE "DeployedContract" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "abi" JSONB,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "networkId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeployedContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DraftContract" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "networkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DraftContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractInteraction" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "args" TEXT[],
    "result" JSONB,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteContract" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeployedContract_address_key" ON "DeployedContract"("address");

-- AddForeignKey
ALTER TABLE "DeployedContract" ADD CONSTRAINT "DeployedContract_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "Network"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractInteraction" ADD CONSTRAINT "ContractInteraction_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "DeployedContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteContract" ADD CONSTRAINT "FavoriteContract_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "DeployedContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
