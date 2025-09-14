-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "freeTrialEndDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartDate" TIMESTAMP(3);
