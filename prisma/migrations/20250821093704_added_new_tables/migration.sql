/*
  Warnings:

  - You are about to drop the column `points` on the `contest_problem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."contest" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subject_id" TEXT;

-- AlterTable
ALTER TABLE "public"."contest_problem" DROP COLUMN "points";

-- AlterTable
ALTER TABLE "public"."submission" ADD COLUMN     "score" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "public"."contest_leaderboard" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "questions_solved" INTEGER NOT NULL,
    "last_submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student_stats" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "current_rank" INTEGER,
    "total_exams" INTEGER NOT NULL DEFAULT 0,
    "total_questions_solved" INTEGER NOT NULL DEFAULT 0,
    "total_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "average_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contest_leaderboard_contest_id_rank_idx" ON "public"."contest_leaderboard"("contest_id", "rank");

-- CreateIndex
CREATE INDEX "contest_leaderboard_student_id_idx" ON "public"."contest_leaderboard"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_leaderboard_contest_id_student_id_key" ON "public"."contest_leaderboard"("contest_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_stats_student_id_key" ON "public"."student_stats"("student_id");

-- CreateIndex
CREATE INDEX "student_stats_current_rank_idx" ON "public"."student_stats"("current_rank");

-- CreateIndex
CREATE INDEX "student_stats_total_score_idx" ON "public"."student_stats"("total_score");

-- AddForeignKey
ALTER TABLE "public"."contest" ADD CONSTRAINT "contest_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_leaderboard" ADD CONSTRAINT "contest_leaderboard_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_leaderboard" ADD CONSTRAINT "contest_leaderboard_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_stats" ADD CONSTRAINT "student_stats_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
