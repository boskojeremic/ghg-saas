-- Reconcile drift: DB already has these columns, but migration history doesn't.
-- Using IF NOT EXISTS to be safe (no-op if already applied).

-- Tenant: licenseStartsAt, licenseEndsAt, seatLimit + index
ALTER TABLE "Tenant"
  ADD COLUMN IF NOT EXISTS "licenseStartsAt" TIMESTAMP(6);

ALTER TABLE "Tenant"
  ADD COLUMN IF NOT EXISTS "licenseEndsAt" TIMESTAMP(6);

ALTER TABLE "Tenant"
  ADD COLUMN IF NOT EXISTS "seatLimit" INTEGER;

-- ensure default if column exists but has no default (safe)
ALTER TABLE "Tenant"
  ALTER COLUMN "seatLimit" SET DEFAULT 1;

-- If there are NULLs (shouldn't be), set to 1 then enforce NOT NULL
UPDATE "Tenant" SET "seatLimit" = 1 WHERE "seatLimit" IS NULL;
ALTER TABLE "Tenant"
  ALTER COLUMN "seatLimit" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_tenant_license_end" ON "Tenant"("licenseEndsAt");

-- Membership: accessStartsAt, accessEndsAt + index
ALTER TABLE "Membership"
  ADD COLUMN IF NOT EXISTS "accessStartsAt" TIMESTAMP(6);

ALTER TABLE "Membership"
  ADD COLUMN IF NOT EXISTS "accessEndsAt" TIMESTAMP(6);

CREATE INDEX IF NOT EXISTS "idx_membership_access_end" ON "Membership"("accessEndsAt");

-- Invite: accessDays
ALTER TABLE "Invite"
  ADD COLUMN IF NOT EXISTS "accessDays" INTEGER;