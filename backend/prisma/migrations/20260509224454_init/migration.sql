-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('NATURAL', 'WASHED', 'HONEY', 'ANAEROBIC', 'CARBONIC_MACERATION');

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Bolivia',
    "region" TEXT NOT NULL,
    "altitude" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "producer" TEXT NOT NULL,
    "story" TEXT,
    "photoIpfs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variety" TEXT NOT NULL,
    "process" "ProcessType" NOT NULL,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "cuppingScore" DOUBLE PRECISION,
    "cuppingNotes" TEXT,
    "cupper" TEXT,
    "roastLevel" TEXT,
    "roastDate" TIMESTAMP(3),
    "roaster" TEXT,
    "metadataIpfs" TEXT,
    "blockchainHash" TEXT,
    "txSignature" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Truck" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Truck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barista" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,

    CONSTRAINT "Barista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cup" (
    "id" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "truckId" TEXT NOT NULL,
    "baristaId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "waterTemp" DOUBLE PRECISION,
    "extractionTime" INTEGER,
    "coffeeDose" DOUBLE PRECISION,
    "waterRatio" DOUBLE PRECISION,
    "baristaNotes" TEXT,
    "redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),
    "walletAddress" TEXT,
    "mintAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" TEXT NOT NULL,
    "cupId" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "fragrancia" INTEGER,
    "aroma" INTEGER,
    "sabor" INTEGER,
    "saborResidual" INTEGER,
    "balance" INTEGER,
    "dulzor" INTEGER,
    "tazaLimpia" INTEGER,
    "acidez" INTEGER,
    "cuerpo" INTEGER,
    "preferencia" INTEGER,
    "scoreSCA" DOUBLE PRECISION,
    "notasFrutado" BOOLEAN NOT NULL DEFAULT false,
    "notasChocolate" BOOLEAN NOT NULL DEFAULT false,
    "notasFloral" BOOLEAN NOT NULL DEFAULT false,
    "notasCitrico" BOOLEAN NOT NULL DEFAULT false,
    "notasNuez" BOOLEAN NOT NULL DEFAULT false,
    "notasCaramelo" BOOLEAN NOT NULL DEFAULT false,
    "notasBerries" BOOLEAN NOT NULL DEFAULT false,
    "notasHerbal" BOOLEAN NOT NULL DEFAULT false,
    "notasEspeciado" BOOLEAN NOT NULL DEFAULT false,
    "notasAhumado" BOOLEAN NOT NULL DEFAULT false,
    "notasLibres" TEXT,
    "audioIpfs" TEXT,
    "photoIpfs" TEXT,
    "comentarios" TEXT,
    "metadataIpfs" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cup_qrCode_key" ON "Cup"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "Bitacora_cupId_key" ON "Bitacora"("cupId");

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Barista" ADD CONSTRAINT "Barista_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cup" ADD CONSTRAINT "Cup_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cup" ADD CONSTRAINT "Cup_truckId_fkey" FOREIGN KEY ("truckId") REFERENCES "Truck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cup" ADD CONSTRAINT "Cup_baristaId_fkey" FOREIGN KEY ("baristaId") REFERENCES "Barista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_cupId_fkey" FOREIGN KEY ("cupId") REFERENCES "Cup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
