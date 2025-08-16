/*
  Warnings:

  - Made the column `description` on table `contest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."contest" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "description" SET DEFAULT '',
ALTER COLUMN "start_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "end_time" SET DEFAULT CURRENT_TIMESTAMP;
