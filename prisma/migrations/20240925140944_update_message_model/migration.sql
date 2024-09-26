-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '1 day',
ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT;

-- CreateIndex
CREATE INDEX "Message_expiresAt_idx" ON "Message"("expiresAt");
