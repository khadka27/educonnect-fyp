-- DropIndex
DROP INDEX "Registration_email_idx";

-- DropIndex
DROP INDEX "Registration_eventId_idx";

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';
