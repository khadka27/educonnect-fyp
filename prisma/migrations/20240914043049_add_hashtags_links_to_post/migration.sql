-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "links" TEXT[] DEFAULT ARRAY[]::TEXT[];
