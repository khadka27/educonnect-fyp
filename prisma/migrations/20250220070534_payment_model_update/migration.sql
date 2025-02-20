/*
  Warnings:

  - The values [PAYPAL,STRIPE] on the enum `PaymentGateway` will be removed. If these variants are still used in the database, this will fail.
  - The values [PAYPAL,STRIPE] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentGateway_new" AS ENUM ('ESEWA', 'KHALTI');
ALTER TABLE "Payment" ALTER COLUMN "paymentGateway" TYPE "PaymentGateway_new" USING ("paymentGateway"::text::"PaymentGateway_new");
ALTER TYPE "PaymentGateway" RENAME TO "PaymentGateway_old";
ALTER TYPE "PaymentGateway_new" RENAME TO "PaymentGateway";
DROP TYPE "PaymentGateway_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('ESEWA', 'KHALTI');
ALTER TABLE "Payment" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
COMMIT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';
