-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "paymentStatus" TEXT,
ADD COLUMN     "transactionId" TEXT;
