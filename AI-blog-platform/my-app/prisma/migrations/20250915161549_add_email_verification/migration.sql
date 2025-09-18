/*
  Warnings:

  - You are about to drop the column `freeTrialEndDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referralCode` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referredById` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStartDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionStatus` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_referredById_fkey";

-- DropIndex
DROP INDEX "public"."User_referralCode_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "freeTrialEndDate",
DROP COLUMN "referralCode",
DROP COLUMN "referredById",
DROP COLUMN "subscriptionStartDate",
DROP COLUMN "subscriptionStatus",
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE "public"."SubscriptionStatus";
