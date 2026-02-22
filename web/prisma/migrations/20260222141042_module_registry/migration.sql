-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('TENANT_ADMIN', 'TENANT_USER');

-- CreateEnum
CREATE TYPE "TenantModuleStatus" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateTable
CREATE TABLE "Industry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Platform" (
    "id" TEXT NOT NULL,
    "industryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Platform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "routePath" TEXT,
    "isAddon" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantPlatform" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(6),
    "endsAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPlatform_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantModule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "status" "TenantModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(6),
    "endsAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Industry_code_key" ON "Industry"("code");

-- CreateIndex
CREATE INDEX "Platform_industryId_idx" ON "Platform"("industryId");

-- CreateIndex
CREATE UNIQUE INDEX "Platform_industryId_code_key" ON "Platform"("industryId", "code");

-- CreateIndex
CREATE INDEX "Module_platformId_idx" ON "Module"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "Module_platformId_code_key" ON "Module"("platformId", "code");

-- CreateIndex
CREATE INDEX "TenantPlatform_tenantId_idx" ON "TenantPlatform"("tenantId");

-- CreateIndex
CREATE INDEX "TenantPlatform_platformId_idx" ON "TenantPlatform"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPlatform_tenantId_platformId_key" ON "TenantPlatform"("tenantId", "platformId");

-- CreateIndex
CREATE INDEX "TenantModule_tenantId_idx" ON "TenantModule"("tenantId");

-- CreateIndex
CREATE INDEX "TenantModule_moduleId_idx" ON "TenantModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantModule_tenantId_moduleId_key" ON "TenantModule"("tenantId", "moduleId");

-- AddForeignKey
ALTER TABLE "Platform" ADD CONSTRAINT "Platform_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPlatform" ADD CONSTRAINT "TenantPlatform_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantPlatform" ADD CONSTRAINT "TenantPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantModule" ADD CONSTRAINT "TenantModule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantModule" ADD CONSTRAINT "TenantModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
