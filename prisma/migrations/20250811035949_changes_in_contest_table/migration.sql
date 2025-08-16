-- AlterTable
ALTER TABLE "public"."problem_tag" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."contest_tag" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contest_tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contest_tag_contest_id_idx" ON "public"."contest_tag"("contest_id");

-- CreateIndex
CREATE INDEX "contest_tag_tag_id_idx" ON "public"."contest_tag"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "contest_tag_contest_id_tag_id_key" ON "public"."contest_tag"("contest_id", "tag_id");

-- AddForeignKey
ALTER TABLE "public"."contest_tag" ADD CONSTRAINT "contest_tag_contest_id_fkey" FOREIGN KEY ("contest_id") REFERENCES "public"."contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contest_tag" ADD CONSTRAINT "contest_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
