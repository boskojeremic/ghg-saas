import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // 1) Industry
  const industry = await db.industry.upsert({
    where: { code: "OIL_GAS" },
    update: { name: "Oil & Gas", isActive: true },
    create: { code: "OIL_GAS", name: "Oil & Gas", isActive: true },
  });

  // 2) Platform(s) under industry
  const platform = await db.platform.upsert({
    where: { industryId_code: { industryId: industry.id, code: "OG_CORE" } },
    update: { name: "Oil & Gas Core Platform", isActive: true, sortOrder: 10 },
    create: {
      industryId: industry.id,
      code: "OG_CORE",
      name: "Oil & Gas Core Platform",
      isActive: true,
      sortOrder: 10,
    },
  });

  // 3) Modules under platform
  const modules = [
    {
      code: "GHG",
      name: "GHG Accounting",
      description: "Emissions inventory, reporting, and analytics",
      routePath: "/og/ghg",
      isAddon: false,
      sortOrder: 10,
    },
    {
      code: "CEMS",
      name: "CEMS Monitoring",
      description: "Continuous emissions monitoring (CEMS) readings and QA",
      routePath: "/og/cems",
      isAddon: true,
      sortOrder: 20,
    },
    {
      code: "OPCUA",
      name: "OPC UA Ingest",
      description: "OPC UA / SCADA ingestion & mapping",
      routePath: "/og/opcua",
      isAddon: true,
      sortOrder: 30,
    },
    {
      code: "REPORTS",
      name: "Reporting",
      description: "Dashboards, exports, compliance reports",
      routePath: "/og/reports",
      isAddon: true,
      sortOrder: 40,
    },
  ];

  for (const m of modules) {
    await db.module.upsert({
      where: { platformId_code: { platformId: platform.id, code: m.code } },
      update: {
        name: m.name,
        description: m.description,
        routePath: m.routePath,
        isAddon: m.isAddon,
        isActive: true,
        sortOrder: m.sortOrder,
      },
      create: {
        platformId: platform.id,
        code: m.code,
        name: m.name,
        description: m.description,
        routePath: m.routePath,
        isAddon: m.isAddon,
        isActive: true,
        sortOrder: m.sortOrder,
      },
    });
  }

  console.log("✅ Seed done:", { industry: industry.code, platform: platform.code, modules: modules.map(x => x.code) });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });