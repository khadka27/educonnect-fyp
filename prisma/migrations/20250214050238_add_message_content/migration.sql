-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "fileName" TEXT,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';
