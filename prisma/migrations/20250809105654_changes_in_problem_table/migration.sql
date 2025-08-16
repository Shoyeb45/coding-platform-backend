/*
  Warnings:

  - A unique constraint covering the columns `[role]` on the table `role_admin` will be added. If there are existing duplicate values, this will fail.
  - Made the column `constraints` on table `problem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."problem" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "problem_statement" SET DEFAULT '',
ALTER COLUMN "constraints" SET NOT NULL,
ALTER COLUMN "constraints" SET DEFAULT '',
ALTER COLUMN "constraints" SET DATA TYPE TEXT,
ALTER COLUMN "difficulty" SET DEFAULT 'Easy';

-- CreateIndex
CREATE UNIQUE INDEX "role_admin_role_key" ON "public"."role_admin"("role");
