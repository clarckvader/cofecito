import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Farms
  const farm1 = await prisma.farm.upsert({
    where: { id: "farm-los-cedros" },
    update: {},
    create: {
      id: "farm-los-cedros",
      name: "Finca Los Cedros",
      country: "Bolivia",
      region: "Yungas",
      altitude: 1850,
      lat: -16.3215,
      lng: -67.5432,
      producer: "Juan Mamani",
      story: "Familia Mamani lleva tres generaciones cultivando café en las laderas de los Yungas.",
    },
  });

  const farm2 = await prisma.farm.upsert({
    where: { id: "farm-caranavi" },
    update: {},
    create: {
      id: "farm-caranavi",
      name: "Pacha Mama Estate",
      country: "Bolivia",
      region: "Caranavi",
      altitude: 1650,
      lat: -15.8312,
      lng: -67.5621,
      producer: "María Quispe",
      story: "Cooperativa de 12 familias en Caranavi con certificación orgánica desde 2018.",
    },
  });

  // Lots
  const lot1 = await prisma.lot.upsert({
    where: { id: "lot-gesha-2024" },
    update: {},
    create: {
      id: "lot-gesha-2024",
      farmId: farm1.id,
      name: "Gesha Micro-Lot #042",
      variety: "Geisha",
      process: "WASHED",
      harvestDate: new Date("2024-06-15"),
      cuppingScore: 88.5,
      cuppingNotes: "Jasmine, bergamot, bright acidity, long finish",
      cupper: "Roberto Flores",
      roastLevel: "Light",
      roastDate: new Date("2024-07-10"),
      roaster: "Cofecito Roastery SCZ",
      active: true,
    },
  });

  const lot2 = await prisma.lot.upsert({
    where: { id: "lot-typica-2024" },
    update: {},
    create: {
      id: "lot-typica-2024",
      farmId: farm2.id,
      name: "Typica Oro Bolivia #038",
      variety: "Typica",
      process: "NATURAL",
      harvestDate: new Date("2024-05-20"),
      cuppingScore: 85.0,
      cuppingNotes: "Dark chocolate, caramel, medium body",
      cupper: "Ana Gutierrez",
      roastLevel: "Medium",
      roastDate: new Date("2024-06-18"),
      roaster: "Cofecito Roastery LPZ",
      active: true,
    },
  });

  const lot3 = await prisma.lot.upsert({
    where: { id: "lot-caturra-2024" },
    update: {},
    create: {
      id: "lot-caturra-2024",
      farmId: farm2.id,
      name: "Caturra Peaberry #8790",
      variety: "Caturra",
      process: "HONEY",
      harvestDate: new Date("2024-07-01"),
      cuppingScore: 83.5,
      active: true,
    },
  });

  // Truck
  const truck = await prisma.truck.upsert({
    where: { id: "truck-scz-01" },
    update: {},
    create: {
      id: "truck-scz-01",
      name: "Cofecito Centro SCZ",
      location: "Plaza 24 de Septiembre, Santa Cruz",
      lat: -17.7834,
      lng: -63.1821,
      active: true,
    },
  });

  // Barista
  const barista = await prisma.barista.upsert({
    where: { id: "barista-maria" },
    update: {},
    create: {
      id: "barista-maria",
      name: "María García",
      truckId: truck.id,
    },
  });

  // Menu items
  await prisma.menuItem.upsert({
    where: { id: "menu-gesha-scz" },
    update: {},
    create: {
      id: "menu-gesha-scz",
      truckId: truck.id,
      lotId: lot1.id,
      price: 35.0,
      active: true,
    },
  });

  await prisma.menuItem.upsert({
    where: { id: "menu-typica-scz" },
    update: {},
    create: {
      id: "menu-typica-scz",
      truckId: truck.id,
      lotId: lot2.id,
      price: 28.0,
      active: true,
    },
  });

  // Sample cups
  const cup1 = await prisma.cup.upsert({
    where: { qrCode: "CFT-2026-000001" },
    update: {},
    create: {
      qrCode: "CFT-2026-000001",
      lotId: lot1.id,
      truckId: truck.id,
      baristaId: barista.id,
      method: "V60",
      waterTemp: 93,
      extractionTime: 180,
      coffeeDose: 15,
      waterRatio: 15,
      baristaNotes: "Bloom 30s, slow pour for clarity",
      redeemed: true,
      redeemedAt: new Date("2026-05-09T10:30:00Z"),
      walletAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      mintAddress: "AuRBSiNeK9Lj3Awd7EXcBBE8JYLZ3oGDgZqPUBMgKn7",
    },
  });

  const cup2 = await prisma.cup.upsert({
    where: { qrCode: "CFT-2026-000002" },
    update: {},
    create: {
      qrCode: "CFT-2026-000002",
      lotId: lot2.id,
      truckId: truck.id,
      baristaId: barista.id,
      method: "Espresso",
      waterTemp: 92,
      extractionTime: 25,
      coffeeDose: 18.5,
      waterRatio: 2,
      redeemed: false,
    },
  });

  // Bitácora for cup1
  await prisma.bitacora.upsert({
    where: { cupId: cup1.id },
    update: {},
    create: {
      cupId: cup1.id,
      mintAddress: cup1.mintAddress!,
      fragrancia: 5,
      aroma: 5,
      sabor: 4,
      saborResidual: 4,
      balance: 4,
      dulzor: 3,
      tazaLimpia: 5,
      acidez: 5,
      cuerpo: 3,
      preferencia: 5,
      scoreSCA: 43,
      notasFrutado: true,
      notasFloral: true,
      notasCitrico: true,
      notasLibres: "Encontré jazmín muy pronunciado, acidez brillante como maracuyá, final largo con durazno.",
      completedAt: new Date("2026-05-09T11:00:00Z"),
    },
  });

  console.log("Seed complete:");
  console.log(`  Farms: ${await prisma.farm.count()}`);
  console.log(`  Lots: ${await prisma.lot.count()}`);
  console.log(`  Trucks: ${await prisma.truck.count()}`);
  console.log(`  Baristas: ${await prisma.barista.count()}`);
  console.log(`  Menu items: ${await prisma.menuItem.count()}`);
  console.log(`  Cups: ${await prisma.cup.count()}`);
  console.log(`  Bitácoras: ${await prisma.bitacora.count()}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
