-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "fileUrl" TEXT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';
