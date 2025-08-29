-- CreateEnum
CREATE TYPE "public"."AuthorRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OPS', 'BATCHOPS', 'TEACHER', 'ASSISTANT_TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateEnum
CREATE TYPE "public"."AttendanceMarkedBy" AS ENUM ('SYSTEM', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "public"."RoleType" AS ENUM ('ADMIN', 'SUPER_ADMIN', 'OPS', 'BATCHOPS');

-- CreateEnum
CREATE TYPE "public"."ExamType" AS ENUM ('END_SEM', 'PROJECT', 'FORTNIGHTLY', 'INTERNAL_ASSESSMENT', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "public"."TeacherRole" AS ENUM ('TEACHER', 'ASSISTANT_TEACHER');

-- CreateEnum
CREATE TYPE "public"."SchoolName" AS ENUM ('SOT', 'SOM', 'SOH');

-- CreateEnum
CREATE TYPE "public"."EventType" AS ENUM ('HACKATHON', 'SEMINAR', 'WORKSHOP', 'ACTIVITY', 'CLUB_EVENT');

-- CreateEnum
CREATE TYPE "public"."WorkMode" AS ENUM ('HYBRID', 'ONSITE', 'REMOTE');

-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('INTERNSHIP', 'FULL_TIME');

-- CreateEnum
CREATE TYPE "public"."Difficulty" AS ENUM ('Easy', 'Medium', 'Hard');

-- CreateTable
CREATE TABLE "public"."Beacon" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "major" INTEGER NOT NULL,
    "minor" INTEGER NOT NULL,
    "room_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Beacon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Class" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "lecture_number" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "division_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Scan" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "detected_beacon_id" TEXT NOT NULL,
    "rssi" INTEGER NOT NULL DEFAULT 0,
    "scan_window_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScanWindow" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "is_processed" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScanWindow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Attendance" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "status" "public"."AttendanceStatus" NOT NULL,
    "successful_scan_count" INTEGER NOT NULL DEFAULT 3,
    "marked_by" "public"."AttendanceMarkedBy" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WindowScanMapping" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "scan_window_id" TEXT NOT NULL,
    "scan_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WindowScanMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "problem_statement" TEXT NOT NULL DEFAULT '',
    "constraints" TEXT NOT NULL DEFAULT '',
    "difficulty" "public"."Difficulty" NOT NULL DEFAULT 'Easy',
    "created_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "problemWeight" INTEGER NOT NULL DEFAULT 30,
    "testcaseWeight" INTEGER NOT NULL DEFAULT 70,

    CONSTRAINT "problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_language" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "prelude" TEXT NOT NULL DEFAULT '',
    "boilerplate" TEXT NOT NULL DEFAULT '',
    "driver_code" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."problem_tag" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "problem_tag_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."contest_tag" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."test_case" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "input" VARCHAR(200) NOT NULL,
    "expected_output" VARCHAR(200) NOT NULL,
    "is_sample" BOOLEAN NOT NULL DEFAULT false,
    "weight" INTEGER NOT NULL DEFAULT 1,
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
    "description" TEXT NOT NULL DEFAULT '',
    "start_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    "student_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "contest_id" TEXT,
    "language_id" TEXT NOT NULL,
    "code" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL,
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
    "status" TEXT NOT NULL,
    "execution_time" DOUBLE PRECISION,
    "memory_used" INTEGER,

    CONSTRAINT "submission_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Center" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "business_head" TEXT,
    "academic_head" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RoleAdmin" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "role" "public"."RoleType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "googleId" TEXT,
    "linkedin" TEXT,
    "role_id" TEXT NOT NULL,
    "designation" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."School" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" "public"."SchoolName" NOT NULL,
    "center_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherCohort" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "teacher_id" TEXT NOT NULL,
    "cohort_id" TEXT NOT NULL,
    "specialisation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherCohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherSchool" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "teacher_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "specialisation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherSchool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Student" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "googleId" TEXT,
    "gender" "public"."Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "firstLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "enrollment_id" TEXT NOT NULL,
    "device_id" TEXT,
    "center_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "division_id" TEXT NOT NULL,
    "cohort_id" TEXT,
    "degree_id" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleTokenExpiry" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Behaviour" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Behaviour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SocialLink" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "changed_by" TEXT NOT NULL,
    "changed_by_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "technologies" TEXT,
    "github_link" TEXT,
    "live_link" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Certification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organisation" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Education" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field_of_study" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "grade" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherAcademicHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "teacher_id" TEXT NOT NULL,
    "x_education" TEXT,
    "xii_education" TEXT,
    "undergraduate" TEXT,
    "postgraduate" TEXT,
    "doctorate" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherAcademicHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AcademicHistory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "x_education" TEXT,
    "xii_education" TEXT,
    "undergraduate" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcademicHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Achievement" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "organisation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cohort" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Division" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "current_semester" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PersonalDetail" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "personal_email" TEXT NOT NULL,
    "fathers_name" TEXT,
    "mothers_name" TEXT,
    "fathers_contact_number" TEXT,
    "mothers_contact_number" TEXT,
    "fathers_occupation" TEXT,
    "mothers_occupation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Batch" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "center_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Semester" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "number" INTEGER NOT NULL,
    "division_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Mentor" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "linkedin" TEXT,
    "designation" TEXT,
    "company" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Subject" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Exam" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL,
    "full_marks" DOUBLE PRECISION NOT NULL,
    "passing_marks" DOUBLE PRECISION NOT NULL,
    "exam_type" "public"."ExamType" NOT NULL,
    "exam_date" TIMESTAMP(3) NOT NULL,
    "subject_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentExamMarks" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "marks_obtained" DOUBLE PRECISION NOT NULL,
    "is_present" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "graded_by" TEXT NOT NULL,
    "graded_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentExamMarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherExperience" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "location" TEXT,
    "work_mode" "public"."WorkMode" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "description" TEXT,
    "teacher_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "TeacherExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Teacher" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "public"."TeacherRole" NOT NULL,
    "googleId" TEXT,
    "linkedin" TEXT,
    "personal_mail" TEXT,
    "github_link" TEXT,
    "gender" "public"."Gender",
    "center_id" TEXT NOT NULL,
    "designation" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "about" TEXT,
    "googleTokenExpiry" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeacherResearchPaper" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "teacher_id" TEXT NOT NULL,
    "research_paper_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherResearchPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ResearchPaper" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(500) NOT NULL,
    "abstract" TEXT,
    "publication_date" TIMESTAMP(3),
    "journal_name" TEXT,
    "doi" TEXT,
    "url" TEXT,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ResearchPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Club" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "leader_id" TEXT NOT NULL,
    "established" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClubOfficial" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "club_id" TEXT NOT NULL,
    "teacher_id" TEXT,
    "admin_id" TEXT,

    CONSTRAINT "ClubOfficial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "organiser" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "type" "public"."EventType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "description" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "thumbnail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Policy" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "pdf_url" TEXT NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "center_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "policy_version" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExternalDegree" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "college_name" TEXT NOT NULL,
    "degree_name" TEXT NOT NULL,
    "specialisation" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalDegree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jd_link" TEXT,
    "work_mode" "public"."WorkMode" NOT NULL,
    "type" "public"."JobType" NOT NULL,
    "company_name" TEXT NOT NULL,
    "vacancy" INTEGER,
    "eligibility" TEXT,
    "description" TEXT,
    "closing_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Placement" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "job_type" "public"."JobType" NOT NULL,
    "work_mode" "public"."WorkMode" NOT NULL,
    "role" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_type" "public"."AuthorRole" NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Flag" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "post_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "flagged_by" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PostMedia" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "storage_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "duration" TEXT,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ClubCoreTeam" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "student_id" TEXT NOT NULL,
    "club_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubCoreTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChangeLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "entity_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "changed_by_type" TEXT NOT NULL,
    "old_data" JSONB,
    "new_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "beacon_room_id_idx" ON "public"."Beacon"("room_id");

-- CreateIndex
CREATE INDEX "class_subject_id_idx" ON "public"."Class"("subject_id");

-- CreateIndex
CREATE INDEX "class_division_id_idx" ON "public"."Class"("division_id");

-- CreateIndex
CREATE INDEX "class_teacher_id_idx" ON "public"."Class"("teacher_id");

-- CreateIndex
CREATE INDEX "class_room_id_idx" ON "public"."Class"("room_id");

-- CreateIndex
CREATE INDEX "scan_student_id_idx" ON "public"."Scan"("student_id");

-- CreateIndex
CREATE INDEX "scan_class_id_idx" ON "public"."Scan"("class_id");

-- CreateIndex
CREATE INDEX "scan_beacon_id_idx" ON "public"."Scan"("detected_beacon_id");

-- CreateIndex
CREATE INDEX "scan_window_id_idx" ON "public"."Scan"("scan_window_id");

-- CreateIndex
CREATE INDEX "scan_window_student_id_idx" ON "public"."ScanWindow"("student_id");

-- CreateIndex
CREATE INDEX "scan_window_class_id_idx" ON "public"."ScanWindow"("class_id");

-- CreateIndex
CREATE INDEX "attendance_student_id_idx" ON "public"."Attendance"("student_id");

-- CreateIndex
CREATE INDEX "attendance_class_id_idx" ON "public"."Attendance"("class_id");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_student_id_class_id_key" ON "public"."Attendance"("student_id", "class_id");

-- CreateIndex
CREATE INDEX "mapping_scan_window_id_idx" ON "public"."WindowScanMapping"("scan_window_id");

-- CreateIndex
CREATE INDEX "mapping_scan_id_idx" ON "public"."WindowScanMapping"("scan_id");

-- CreateIndex
CREATE UNIQUE INDEX "WindowScanMapping_scan_window_id_scan_id_key" ON "public"."WindowScanMapping"("scan_window_id", "scan_id");

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
CREATE INDEX "problem_language_id_idx" ON "public"."problem_language"("id");

-- CreateIndex
CREATE INDEX "problem_language_problem_id_language_id_idx" ON "public"."problem_language"("problem_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_language_problem_id_language_id_key" ON "public"."problem_language"("problem_id", "language_id");

-- CreateIndex
CREATE INDEX "problem_tag_problem_id_idx" ON "public"."problem_tag"("problem_id");

-- CreateIndex
CREATE INDEX "problem_tag_tag_id_idx" ON "public"."problem_tag"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_tag_problem_id_tag_id_key" ON "public"."problem_tag"("problem_id", "tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_name_key" ON "public"."tag"("name");

-- CreateIndex
CREATE INDEX "tag_name_idx" ON "public"."tag"("name");

-- CreateIndex
CREATE INDEX "contest_tag_contest_id_idx" ON "public"."contest_tag"("contest_id");

-- CreateIndex
CREATE INDEX "contest_tag_tag_id_idx" ON "public"."contest_tag"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_tag_contest_id_tag_id_key" ON "public"."contest_tag"("contest_id", "tag_id");

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
CREATE UNIQUE INDEX "contest_moderator_contest_id_moderator_id_key" ON "public"."contest_moderator"("contest_id", "moderator_id");

-- CreateIndex
CREATE INDEX "contest_problem_contest_id_idx" ON "public"."contest_problem"("contest_id");

-- CreateIndex
CREATE INDEX "contest_problem_problem_id_idx" ON "public"."contest_problem"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_problem_contest_id_problem_id_key" ON "public"."contest_problem"("contest_id", "problem_id");

-- CreateIndex
CREATE INDEX "submission_status_name_idx" ON "public"."submission_status"("name");

-- CreateIndex
CREATE INDEX "submission_student_id_idx" ON "public"."submission"("student_id");

-- CreateIndex
CREATE INDEX "submission_problem_id_idx" ON "public"."submission"("problem_id");

-- CreateIndex
CREATE INDEX "submission_contest_id_idx" ON "public"."submission"("contest_id");

-- CreateIndex
CREATE INDEX "submission_language_id_idx" ON "public"."submission"("language_id");

-- CreateIndex
CREATE INDEX "submission_submitted_at_idx" ON "public"."submission"("submitted_at");

-- CreateIndex
CREATE INDEX "submission_result_submission_id_idx" ON "public"."submission_result"("submission_id");

-- CreateIndex
CREATE INDEX "submission_result_test_case_id_idx" ON "public"."submission_result"("test_case_id");

-- CreateIndex
CREATE UNIQUE INDEX "Center_code_key" ON "public"."Center"("code");

-- CreateIndex
CREATE INDEX "center_business_head_idx" ON "public"."Center"("business_head");

-- CreateIndex
CREATE INDEX "center_academic_head_idx" ON "public"."Center"("academic_head");

-- CreateIndex
CREATE UNIQUE INDEX "RoleAdmin_role_key" ON "public"."RoleAdmin"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "public"."Admin"("phone");

-- CreateIndex
CREATE INDEX "school_center_id_idx" ON "public"."School"("center_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_school_name_per_center" ON "public"."School"("center_id", "name");

-- CreateIndex
CREATE INDEX "teacher_cohort_teacher_id_idx" ON "public"."TeacherCohort"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_cohort_cohort_id_idx" ON "public"."TeacherCohort"("cohort_id");

-- CreateIndex
CREATE INDEX "teacher_school_teacher_id_idx" ON "public"."TeacherSchool"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_school_school_id_idx" ON "public"."TeacherSchool"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "public"."Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_phone_key" ON "public"."Student"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Student_enrollment_id_key" ON "public"."Student"("enrollment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Student_device_id_key" ON "public"."Student"("device_id");

-- CreateIndex
CREATE INDEX "behaviour_admin_id_idx" ON "public"."Behaviour"("admin_id");

-- CreateIndex
CREATE INDEX "behaviour_student_id_idx" ON "public"."Behaviour"("student_id");

-- CreateIndex
CREATE INDEX "social_link_student_id_idx" ON "public"."SocialLink"("student_id");

-- CreateIndex
CREATE INDEX "student_log_student_id_idx" ON "public"."StudentLog"("student_id");

-- CreateIndex
CREATE INDEX "project_student_id_idx" ON "public"."Project"("student_id");

-- CreateIndex
CREATE INDEX "certification_student_id_idx" ON "public"."Certification"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "TeacherAcademicHistory_teacher_id_key" ON "public"."TeacherAcademicHistory"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_academic_history_x_edu_idx" ON "public"."TeacherAcademicHistory"("x_education");

-- CreateIndex
CREATE INDEX "teacher_academic_history_xii_edu_idx" ON "public"."TeacherAcademicHistory"("xii_education");

-- CreateIndex
CREATE INDEX "teacher_academic_history_ug_edu_idx" ON "public"."TeacherAcademicHistory"("undergraduate");

-- CreateIndex
CREATE INDEX "teacher_academic_history_pg_edu_idx" ON "public"."TeacherAcademicHistory"("postgraduate");

-- CreateIndex
CREATE INDEX "teacher_academic_history_doc_edu_idx" ON "public"."TeacherAcademicHistory"("doctorate");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicHistory_student_id_key" ON "public"."AcademicHistory"("student_id");

-- CreateIndex
CREATE INDEX "academic_history_x_edu_idx" ON "public"."AcademicHistory"("x_education");

-- CreateIndex
CREATE INDEX "academic_history_xii_edu_idx" ON "public"."AcademicHistory"("xii_education");

-- CreateIndex
CREATE INDEX "academic_history_ug_edu_idx" ON "public"."AcademicHistory"("undergraduate");

-- CreateIndex
CREATE INDEX "achievement_student_id_idx" ON "public"."Achievement"("student_id");

-- CreateIndex
CREATE INDEX "cohort_center_id_idx" ON "public"."Cohort"("center_id");

-- CreateIndex
CREATE UNIQUE INDEX "Division_code_key" ON "public"."Division"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Division_current_semester_key" ON "public"."Division"("current_semester");

-- CreateIndex
CREATE INDEX "division_batch_id_idx" ON "public"."Division"("batch_id");

-- CreateIndex
CREATE INDEX "division_semester_id_idx" ON "public"."Division"("current_semester");

-- CreateIndex
CREATE INDEX "division_center_id_idx" ON "public"."Division"("center_id");

-- CreateIndex
CREATE INDEX "division_school_id_idx" ON "public"."Division"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalDetail_student_id_key" ON "public"."PersonalDetail"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalDetail_personal_email_key" ON "public"."PersonalDetail"("personal_email");

-- CreateIndex
CREATE INDEX "personal_detail_student_id_idx" ON "public"."PersonalDetail"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_name_key" ON "public"."Batch"("name");

-- CreateIndex
CREATE INDEX "batch_center_id_idx" ON "public"."Batch"("center_id");

-- CreateIndex
CREATE INDEX "batch_school_id_idx" ON "public"."Batch"("school_id");

-- CreateIndex
CREATE INDEX "semester_division_id_idx" ON "public"."Semester"("division_id");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_email_key" ON "public"."Mentor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mentor_phone_key" ON "public"."Mentor"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "public"."Subject"("code");

-- CreateIndex
CREATE INDEX "subject_semester_id_idx" ON "public"."Subject"("semester_id");

-- CreateIndex
CREATE INDEX "subject_teacher_id_idx" ON "public"."Subject"("teacher_id");

-- CreateIndex
CREATE INDEX "exam_subject_id_idx" ON "public"."Exam"("subject_id");

-- CreateIndex
CREATE INDEX "exam_marks_student_id_idx" ON "public"."StudentExamMarks"("student_id");

-- CreateIndex
CREATE INDEX "exam_marks_subject_id_idx" ON "public"."StudentExamMarks"("subject_id");

-- CreateIndex
CREATE INDEX "exam_marks_exam_id_idx" ON "public"."StudentExamMarks"("exam_id");

-- CreateIndex
CREATE INDEX "exam_marks_teacher_id_idx" ON "public"."StudentExamMarks"("graded_by");

-- CreateIndex
CREATE UNIQUE INDEX "StudentExamMarks_student_id_exam_id_key" ON "public"."StudentExamMarks"("student_id", "exam_id");

-- CreateIndex
CREATE INDEX "teacher_experience_teacher_id_idx" ON "public"."TeacherExperience"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "public"."Teacher"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "public"."Teacher"("phone");

-- CreateIndex
CREATE INDEX "teacher_center_id_idx" ON "public"."Teacher"("center_id");

-- CreateIndex
CREATE INDEX "teacher_paper_teacher_id_idx" ON "public"."TeacherResearchPaper"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_paper_paper_id_idx" ON "public"."TeacherResearchPaper"("research_paper_id");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchPaper_doi_key" ON "public"."ResearchPaper"("doi");

-- CreateIndex
CREATE INDEX "club_leader_id_idx" ON "public"."Club"("leader_id");

-- CreateIndex
CREATE INDEX "club_official_club_id_idx" ON "public"."ClubOfficial"("club_id");

-- CreateIndex
CREATE INDEX "club_official_teacher_id_idx" ON "public"."ClubOfficial"("teacher_id");

-- CreateIndex
CREATE INDEX "club_official_admin_id_idx" ON "public"."ClubOfficial"("admin_id");

-- CreateIndex
CREATE INDEX "policy_center_id_idx" ON "public"."Policy"("center_id");

-- CreateIndex
CREATE INDEX "placement_student_id_idx" ON "public"."Placement"("student_id");

-- CreateIndex
CREATE INDEX "flag_post_id_idx" ON "public"."Flag"("post_id");

-- CreateIndex
CREATE INDEX "comment_post_id_idx" ON "public"."Comment"("post_id");

-- CreateIndex
CREATE INDEX "post_media_post_id_idx" ON "public"."PostMedia"("post_id");

-- CreateIndex
CREATE INDEX "core_team_student_id_idx" ON "public"."ClubCoreTeam"("student_id");

-- CreateIndex
CREATE INDEX "core_team_club_id_idx" ON "public"."ClubCoreTeam"("club_id");

-- AddForeignKey
ALTER TABLE "public"."Beacon" ADD CONSTRAINT "Beacon_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Class" ADD CONSTRAINT "Class_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Scan" ADD CONSTRAINT "Scan_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Scan" ADD CONSTRAINT "Scan_detected_beacon_id_fkey" FOREIGN KEY ("detected_beacon_id") REFERENCES "public"."Beacon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Scan" ADD CONSTRAINT "Scan_scan_window_id_fkey" FOREIGN KEY ("scan_window_id") REFERENCES "public"."ScanWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Scan" ADD CONSTRAINT "Scan_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScanWindow" ADD CONSTRAINT "ScanWindow_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScanWindow" ADD CONSTRAINT "ScanWindow_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WindowScanMapping" ADD CONSTRAINT "WindowScanMapping_scan_id_fkey" FOREIGN KEY ("scan_id") REFERENCES "public"."Scan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WindowScanMapping" ADD CONSTRAINT "WindowScanMapping_scan_window_id_fkey" FOREIGN KEY ("scan_window_id") REFERENCES "public"."ScanWindow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem" ADD CONSTRAINT "problem_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_language" ADD CONSTRAINT "problem_language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."programming_language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_language" ADD CONSTRAINT "problem_language_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "problem_tag_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_tag" ADD CONSTRAINT "problem_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_tag" ADD CONSTRAINT "contest_tag_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_tag" ADD CONSTRAINT "contest_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."test_case" ADD CONSTRAINT "test_case_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_moderator" ADD CONSTRAINT "problem_moderator_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_moderator" ADD CONSTRAINT "problem_moderator_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest" ADD CONSTRAINT "contest_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_contest" ADD CONSTRAINT "batch_contest_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."batch_contest" ADD CONSTRAINT "batch_contest_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allowed_language" ADD CONSTRAINT "allowed_language_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."allowed_language" ADD CONSTRAINT "allowed_language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."programming_language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_moderator" ADD CONSTRAINT "contest_moderator_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_moderator" ADD CONSTRAINT "contest_moderator_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_problem" ADD CONSTRAINT "contest_problem_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_problem" ADD CONSTRAINT "contest_problem_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."programming_language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission" ADD CONSTRAINT "submission_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_result" ADD CONSTRAINT "submission_result_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submission_result" ADD CONSTRAINT "submission_result_test_case_id_fkey" FOREIGN KEY ("test_case_id") REFERENCES "public"."test_case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Center" ADD CONSTRAINT "Center_academic_head_fkey" FOREIGN KEY ("academic_head") REFERENCES "public"."Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Center" ADD CONSTRAINT "Center_business_head_fkey" FOREIGN KEY ("business_head") REFERENCES "public"."Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Admin" ADD CONSTRAINT "Admin_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."RoleAdmin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."School" ADD CONSTRAINT "School_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherCohort" ADD CONSTRAINT "TeacherCohort_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "public"."Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherCohort" ADD CONSTRAINT "TeacherCohort_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherSchool" ADD CONSTRAINT "TeacherSchool_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherSchool" ADD CONSTRAINT "TeacherSchool_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "public"."Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_degree_id_fkey" FOREIGN KEY ("degree_id") REFERENCES "public"."ExternalDegree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Behaviour" ADD CONSTRAINT "Behaviour_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Behaviour" ADD CONSTRAINT "Behaviour_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialLink" ADD CONSTRAINT "SocialLink_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentLog" ADD CONSTRAINT "StudentLog_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Certification" ADD CONSTRAINT "Certification_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAcademicHistory" ADD CONSTRAINT "TeacherAcademicHistory_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAcademicHistory" ADD CONSTRAINT "TeacherAcademicHistory_x_education_fkey" FOREIGN KEY ("x_education") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAcademicHistory" ADD CONSTRAINT "TeacherAcademicHistory_xii_education_fkey" FOREIGN KEY ("xii_education") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAcademicHistory" ADD CONSTRAINT "TeacherAcademicHistory_undergraduate_fkey" FOREIGN KEY ("undergraduate") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAcademicHistory" ADD CONSTRAINT "TeacherAcademicHistory_postgraduate_fkey" FOREIGN KEY ("postgraduate") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherAcademicHistory" ADD CONSTRAINT "TeacherAcademicHistory_doctorate_fkey" FOREIGN KEY ("doctorate") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicHistory" ADD CONSTRAINT "AcademicHistory_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicHistory" ADD CONSTRAINT "AcademicHistory_undergraduate_fkey" FOREIGN KEY ("undergraduate") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicHistory" ADD CONSTRAINT "AcademicHistory_x_education_fkey" FOREIGN KEY ("x_education") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AcademicHistory" ADD CONSTRAINT "AcademicHistory_xii_education_fkey" FOREIGN KEY ("xii_education") REFERENCES "public"."Education"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Achievement" ADD CONSTRAINT "Achievement_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cohort" ADD CONSTRAINT "Cohort_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Division" ADD CONSTRAINT "Division_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Division" ADD CONSTRAINT "Division_current_semester_fkey" FOREIGN KEY ("current_semester") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Division" ADD CONSTRAINT "Division_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Division" ADD CONSTRAINT "Division_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalDetail" ADD CONSTRAINT "PersonalDetail_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Batch" ADD CONSTRAINT "Batch_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Batch" ADD CONSTRAINT "Batch_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "public"."Semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentExamMarks" ADD CONSTRAINT "StudentExamMarks_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentExamMarks" ADD CONSTRAINT "StudentExamMarks_graded_by_fkey" FOREIGN KEY ("graded_by") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentExamMarks" ADD CONSTRAINT "StudentExamMarks_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentExamMarks" ADD CONSTRAINT "StudentExamMarks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherExperience" ADD CONSTRAINT "TeacherExperience_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherResearchPaper" ADD CONSTRAINT "TeacherResearchPaper_research_paper_id_fkey" FOREIGN KEY ("research_paper_id") REFERENCES "public"."ResearchPaper"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeacherResearchPaper" ADD CONSTRAINT "TeacherResearchPaper_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Club" ADD CONSTRAINT "Club_leader_id_fkey" FOREIGN KEY ("leader_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubOfficial" ADD CONSTRAINT "ClubOfficial_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubOfficial" ADD CONSTRAINT "ClubOfficial_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubOfficial" ADD CONSTRAINT "ClubOfficial_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "public"."Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Policy" ADD CONSTRAINT "Policy_center_id_fkey" FOREIGN KEY ("center_id") REFERENCES "public"."Center"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Placement" ADD CONSTRAINT "Placement_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Flag" ADD CONSTRAINT "Flag_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PostMedia" ADD CONSTRAINT "PostMedia_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubCoreTeam" ADD CONSTRAINT "ClubCoreTeam_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClubCoreTeam" ADD CONSTRAINT "ClubCoreTeam_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
