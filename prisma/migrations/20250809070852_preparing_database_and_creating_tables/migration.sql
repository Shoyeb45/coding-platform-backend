-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'OPS');

-- CreateTable
CREATE TABLE "public"."center" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "businessHead" TEXT NOT NULL,
    "academicHead" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_admin" (
    "id" TEXT NOT NULL,
    "role" "public"."RoleType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."admin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "linkedin" TEXT,
    "role_id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."school" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teacher" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "linkedin" TEXT,
    "experience" TEXT,
    "gender" "public"."Gender" NOT NULL,
    "center_id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gender" "public"."Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "enrollment_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "problem_statement" TEXT NOT NULL,
    "constraints" VARCHAR(200),
    "difficulty" "public"."Difficulty" NOT NULL,
    "created_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_tag" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."test_case" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "input" VARCHAR(200) NOT NULL,
    "expected_output" VARCHAR(200) NOT NULL,
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "point" INTEGER,
    "explanation" TEXT,

    CONSTRAINT "test_case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_moderator" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_moderator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contest" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "is_open" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."batch_contest" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_contest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."programming_language" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "judge0_code" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programming_language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."allowed_language" (
    "id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allowed_language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contest_moderator" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_moderator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contest_problem" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission_status" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,

    CONSTRAINT "submission_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "status_id" TEXT NOT NULL,
    "execution_time" DOUBLE PRECISION,
    "memory_used" DOUBLE PRECISION,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submission_result" (
    "id" TEXT NOT NULL,
    "submission_id" TEXT NOT NULL,
    "test_case_id" TEXT NOT NULL,
    "status_id" TEXT NOT NULL,
    "execution_time" DOUBLE PRECISION,
    "memory_used" INTEGER,

    CONSTRAINT "submission_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "center_code_key" ON "public"."center"("code");

-- CreateIndex
CREATE INDEX "center_code_idx" ON "public"."center"("code");

-- CreateIndex
CREATE INDEX "center_businessHead_idx" ON "public"."center"("businessHead");

-- CreateIndex
CREATE INDEX "center_academicHead_idx" ON "public"."center"("academicHead");

-- CreateIndex
CREATE INDEX "role_admin_role_idx" ON "public"."role_admin"("role");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "public"."admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_phone_key" ON "public"."admin"("phone");

-- CreateIndex
CREATE INDEX "admin_email_idx" ON "public"."admin"("email");

-- CreateIndex
CREATE INDEX "admin_phone_idx" ON "public"."admin"("phone");

-- CreateIndex
CREATE INDEX "admin_role_id_idx" ON "public"."admin"("role_id");

-- CreateIndex
CREATE INDEX "school_center_id_idx" ON "public"."school"("center_id");

-- CreateIndex
CREATE UNIQUE INDEX "batch_name_key" ON "public"."batch"("name");

-- CreateIndex
CREATE INDEX "batch_center_id_idx" ON "public"."batch"("center_id");

-- CreateIndex
CREATE INDEX "batch_school_id_idx" ON "public"."batch"("school_id");

-- CreateIndex
CREATE INDEX "batch_name_idx" ON "public"."batch"("name");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_email_key" ON "public"."teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_phone_key" ON "public"."teacher"("phone");

-- CreateIndex
CREATE INDEX "teacher_email_idx" ON "public"."teacher"("email");

-- CreateIndex
CREATE INDEX "teacher_phone_idx" ON "public"."teacher"("phone");

-- CreateIndex
CREATE INDEX "teacher_center_id_idx" ON "public"."teacher"("center_id");

-- CreateIndex
CREATE UNIQUE INDEX "student_email_key" ON "public"."student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_phone_key" ON "public"."student"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "student_enrollment_id_key" ON "public"."student"("enrollment_id");

-- CreateIndex
CREATE INDEX "student_email_idx" ON "public"."student"("email");

-- CreateIndex
CREATE INDEX "student_phone_idx" ON "public"."student"("phone");

-- CreateIndex
CREATE INDEX "student_enrollment_id_idx" ON "public"."student"("enrollment_id");

-- CreateIndex
CREATE INDEX "student_batch_id_idx" ON "public"."student"("batch_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "public"."tag"("name");

-- CreateIndex
CREATE INDEX "tag_name_idx" ON "public"."tag"("name");

-- CreateIndex
CREATE INDEX "problem_created_by_idx" ON "public"."problem"("created_by");

-- CreateIndex
CREATE INDEX "problem_difficulty_idx" ON "public"."problem"("difficulty");

-- CreateIndex
CREATE INDEX "problem_is_active_idx" ON "public"."problem"("is_active");

-- CreateIndex
CREATE INDEX "problem_is_public_idx" ON "public"."problem"("is_public");

-- CreateIndex
CREATE INDEX "problem_title_idx" ON "public"."problem"("title");

-- CreateIndex
CREATE INDEX "problem_tag_problem_id_idx" ON "public"."problem_tag"("problem_id");

-- CreateIndex
CREATE INDEX "problem_tag_tag_id_idx" ON "public"."problem_tag"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_tag_problem_id_tag_id_key" ON "public"."problem_tag"("problem_id", "tag_id");

-- CreateIndex
CREATE INDEX "test_case_problem_id_idx" ON "public"."test_case"("problem_id");

-- CreateIndex
CREATE INDEX "test_case_is_sample_idx" ON "public"."test_case"("is_sample");

-- CreateIndex
CREATE INDEX "problem_moderator_problem_id_idx" ON "public"."problem_moderator"("problem_id");

-- CreateIndex
CREATE INDEX "problem_moderator_moderator_id_idx" ON "public"."problem_moderator"("moderator_id");

-- CreateIndex
CREATE INDEX "contest_created_by_idx" ON "public"."contest"("created_by");

-- CreateIndex
CREATE INDEX "contest_start_time_idx" ON "public"."contest"("start_time");

-- CreateIndex
CREATE INDEX "contest_end_time_idx" ON "public"."contest"("end_time");

-- CreateIndex
CREATE INDEX "contest_is_open_idx" ON "public"."contest"("is_open");

-- CreateIndex
CREATE INDEX "contest_title_idx" ON "public"."contest"("title");

-- CreateIndex
CREATE INDEX "batch_contest_batch_id_idx" ON "public"."batch_contest"("batch_id");

-- CreateIndex
CREATE INDEX "batch_contest_contest_id_idx" ON "public"."batch_contest"("contest_id");

-- CreateIndex
CREATE UNIQUE INDEX "programming_language_name_key" ON "public"."programming_language"("name");

-- CreateIndex
CREATE UNIQUE INDEX "programming_language_judge0_code_key" ON "public"."programming_language"("judge0_code");

-- CreateIndex
CREATE INDEX "programming_language_name_idx" ON "public"."programming_language"("name");

-- CreateIndex
CREATE INDEX "programming_language_judge0_code_idx" ON "public"."programming_language"("judge0_code");

-- CreateIndex
CREATE INDEX "allowed_language_language_id_idx" ON "public"."allowed_language"("language_id");

-- CreateIndex
CREATE INDEX "allowed_language_contest_id_idx" ON "public"."allowed_language"("contest_id");

-- CreateIndex
CREATE INDEX "contest_moderator_contest_id_idx" ON "public"."contest_moderator"("contest_id");

-- CreateIndex
CREATE INDEX "contest_moderator_moderator_id_idx" ON "public"."contest_moderator"("moderator_id");

-- CreateIndex
CREATE INDEX "contest_problem_contest_id_idx" ON "public"."contest_problem"("contest_id");

-- CreateIndex
CREATE INDEX "contest_problem_problem_id_idx" ON "public"."contest_problem"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_contest_id_problem_id_key" ON "public"."contest_problem"("contest_id", "problem_id");

-- CreateIndex
CREATE INDEX "submission_status_name_idx" ON "public"."submission_status"("name");

-- CreateIndex
CREATE INDEX "submission_user_id_idx" ON "public"."submission"("user_id");

-- CreateIndex
CREATE INDEX "submission_problem_id_idx" ON "public"."submission"("problem_id");

-- CreateIndex
CREATE INDEX "submission_contest_id_idx" ON "public"."submission"("contest_id");

-- CreateIndex
CREATE INDEX "submission_language_id_idx" ON "public"."submission"("language_id");

-- CreateIndex
CREATE INDEX "submission_status_id_idx" ON "public"."submission"("status_id");

-- CreateIndex
CREATE INDEX "submission_submitted_at_idx" ON "public"."submission"("submitted_at");

-- CreateIndex
CREATE INDEX "submission_result_submission_id_idx" ON "public"."submission_result"("submission_id");

-- CreateIndex
CREATE INDEX "submission_result_test_case_id_idx" ON "public"."submission_result"("test_case_id");

-- CreateIndex
CREATE INDEX "submission_result_status_id_idx" ON "public"."submission_result"("status_id");

-- AddForeignKey
ALTER TABLE "public"."center" ADD CONSTRAINT "center_businessHead_fkey" FOREIGN KEY ("businessHead") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."center" ADD CONSTRAINT "center_academicHead_fkey" FOREIGN KEY ("academicHead") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."admin" ADD CONSTRAINT "admin_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role_admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."school" ADD CONSTRAINT "school_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch" ADD CONSTRAINT "batch_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch" ADD CONSTRAINT "batch_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."school"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."teacher" ADD CONSTRAINT "teacher_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student" ADD CONSTRAINT "student_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem" ADD CONSTRAINT "problem_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "problem_tag_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "problem_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_case" ADD CONSTRAINT "test_case_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_moderator" ADD CONSTRAINT "problem_moderator_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_moderator" ADD CONSTRAINT "problem_moderator_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "public"."teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest" ADD CONSTRAINT "contest_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_contest" ADD CONSTRAINT "batch_contest_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_contest" ADD CONSTRAINT "batch_contest_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allowed_language" ADD CONSTRAINT "allowed_language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."programming_language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allowed_language" ADD CONSTRAINT "allowed_language_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_moderator" ADD CONSTRAINT "contest_moderator_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_moderator" ADD CONSTRAINT "contest_moderator_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "public"."teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_problem" ADD CONSTRAINT "contest_problem_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_problem" ADD CONSTRAINT "contest_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."programming_language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."submission_status"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_result" ADD CONSTRAINT "submission_result_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_result" ADD CONSTRAINT "submission_result_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_result" ADD CONSTRAINT "submission_result_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."submission_status"("id") ON DELETE CASCADE ON UPDATE CASCADE;
