-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "harmfulContent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "harmfulScore" DOUBLE PRECISION,
ADD COLUMN     "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "labels" TEXT[],
ADD COLUMN     "titleImage" TEXT;
