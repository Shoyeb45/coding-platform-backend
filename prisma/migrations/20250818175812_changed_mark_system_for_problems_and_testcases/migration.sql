/*
  Warnings:

  - You are about to drop the column `points` on the `problem` table. All the data in the column will be lost.
  - You are about to drop the column `point` on the `test_case` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."problem" DROP COLUMN "points",
ADD COLUMN     "problemWeight" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "testcaseWeight" INTEGER NOT NULL DEFAULT 70;

-- AlterTable
ALTER TABLE "public"."test_case" DROP COLUMN "point",
ADD COLUMN     "weight" INTEGER NOT NULL DEFAULT 1;
