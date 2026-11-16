-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerkInvitationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkInvitationId_key" ON "User"("clerkInvitationId");
