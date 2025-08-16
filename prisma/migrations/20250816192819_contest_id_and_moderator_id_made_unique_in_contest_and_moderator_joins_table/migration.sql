/*
  Warnings:

  - A unique constraint covering the columns `[contest_id,moderator_id]` on the table `contest_moderator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "contest_moderator_contest_id_moderator_id_key" ON "public"."contest_moderator"("contest_id", "moderator_id");
