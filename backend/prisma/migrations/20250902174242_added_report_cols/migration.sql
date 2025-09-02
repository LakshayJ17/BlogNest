-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'removed';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isReported" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "numberOfReports" INTEGER NOT NULL DEFAULT 0;
