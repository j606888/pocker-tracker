-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('FOCUSED', 'NORMAL', 'TIRED', 'TILT');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "mood" "Mood",
ADD COLUMN     "rebuys" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "venueId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankroll" INTEGER;

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Venue_userId_idx" ON "Venue"("userId");

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;
