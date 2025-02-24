-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '1 day';

-- CreateTable
CREATE TABLE "GroupMemberDemo" (
    "groupMemberId" TEXT NOT NULL,

    CONSTRAINT "GroupMemberDemo_pkey" PRIMARY KEY ("groupMemberId")
);
