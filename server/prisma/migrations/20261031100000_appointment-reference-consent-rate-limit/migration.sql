-- Add human-readable appointment references and persist explicit consent.
ALTER TABLE "Appointment"
ADD COLUMN "reference" VARCHAR(48),
ADD COLUMN "privacyConsent" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Appointment"
SET "reference" = 'DH-LEGACY-' || REPLACE("id"::text, '-', '')
WHERE "reference" IS NULL;

ALTER TABLE "Appointment"
ALTER COLUMN "reference" SET NOT NULL;

CREATE UNIQUE INDEX "Appointment_reference_key" ON "Appointment"("reference");

-- Store only HMAC-derived phone/bucket keys, never raw visitor IP addresses.
CREATE TABLE "PublicSubmissionRateLimit" (
    "key" VARCHAR(64) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PublicSubmissionRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "PublicSubmissionRateLimit_expiresAt_idx"
ON "PublicSubmissionRateLimit"("expiresAt");
