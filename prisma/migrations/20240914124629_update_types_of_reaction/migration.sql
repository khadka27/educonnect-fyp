/*
  Warnings:

  - Changed the type of `type` on the `Reaction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "type",
ADD COLUMN     "type" BOOLEAN NOT NULL;

-- DropEnum
DROP TYPE "ReactionType";
