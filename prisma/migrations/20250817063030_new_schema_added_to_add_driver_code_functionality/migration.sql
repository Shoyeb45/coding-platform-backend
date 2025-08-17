-- CreateTable
CREATE TABLE "public"."problem_language" (
    "id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "language_id" TEXT NOT NULL,
    "prelude" TEXT NOT NULL DEFAULT '',
    "boilerplate" TEXT NOT NULL DEFAULT '',
    "driver_code" TEXT NOT NULL DEFAULT '',
    "function_signature" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "problem_language_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "problem_language_id_idx" ON "public"."problem_language"("id");

-- CreateIndex
CREATE INDEX "problem_language_problem_id_language_id_idx" ON "public"."problem_language"("problem_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_language_problem_id_language_id_key" ON "public"."problem_language"("problem_id", "language_id");

-- AddForeignKey
ALTER TABLE "public"."problem_language" ADD CONSTRAINT "problem_language_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_language" ADD CONSTRAINT "problem_language_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "public"."programming_language"("id") ON DELETE CASCADE ON UPDATE CASCADE;
