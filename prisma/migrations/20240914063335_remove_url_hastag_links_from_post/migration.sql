/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `hashtags` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `links` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "fileUrl",
DROP COLUMN "hashtags",
DROP COLUMN "imageUrl",
DROP COLUMN "links",
ADD COLUMN     "postUrl" TEXT;
