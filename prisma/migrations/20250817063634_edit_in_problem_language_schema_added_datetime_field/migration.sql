/*
  Warnings:

  - You are about to drop the column `function_signature` on the `problem_language` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."problem_language" DROP COLUMN "function_signature",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
