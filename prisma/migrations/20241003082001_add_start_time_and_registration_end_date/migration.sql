-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "registrationEndDate" DROP NOT NULL,
ALTER COLUMN "startTime" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';
