/*
  Warnings:

  - You are about to drop the column `harmfulContent` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `harmfulScore` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `isDraft` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `published` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published', 'archived', 'deleted');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "harmfulContent",
DROP COLUMN "harmfulScore",
DROP COLUMN "isDraft",
DROP COLUMN "published",
ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'draft';

-- CreateIndex
CREATE INDEX "Post_authorId_status_idx" ON "Post"("authorId", "status");
