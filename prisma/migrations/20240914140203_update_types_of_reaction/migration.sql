/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId,type]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Reaction" ALTER COLUMN "type" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_postId_userId_type_key" ON "Reaction"("postId", "userId", "type");
