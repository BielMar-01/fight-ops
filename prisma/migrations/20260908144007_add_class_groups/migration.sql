-- CreateEnum
CREATE TYPE "ClassGroupLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MIXED');

-- CreateEnum
CREATE TYPE "ClassGroupProfessorRole" AS ENUM ('PRIMARY', 'ASSISTANT');

-- CreateTable
CREATE TABLE "class_groups" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "modality_id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "level" "ClassGroupLevel" NOT NULL DEFAULT 'MIXED',
    "minimum_age" INTEGER,
    "maximum_age" INTEGER,
    "max_students" INTEGER,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "class_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_group_professors" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "class_group_id" UUID NOT NULL,
    "professor_id" UUID NOT NULL,
    "role" "ClassGroupProfessorRole" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "class_group_professors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_groups_gym_id_idx" ON "class_groups"("gym_id");

-- CreateIndex
CREATE INDEX "class_groups_modality_id_idx" ON "class_groups"("modality_id");

-- CreateIndex
CREATE INDEX "class_groups_gym_id_active_idx" ON "class_groups"("gym_id", "active");

-- CreateIndex
CREATE INDEX "class_groups_gym_id_modality_id_idx" ON "class_groups"("gym_id", "modality_id");

-- CreateIndex
CREATE INDEX "class_groups_gym_id_modality_id_active_idx" ON "class_groups"("gym_id", "modality_id", "active");

-- CreateIndex
CREATE INDEX "class_groups_gym_id_level_idx" ON "class_groups"("gym_id", "level");

-- CreateIndex
CREATE INDEX "class_groups_gym_id_name_idx" ON "class_groups"("gym_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "uk_class_groups_gym_name" ON "class_groups"("gym_id", "name");

-- CreateIndex
CREATE INDEX "class_group_professors_gym_id_idx" ON "class_group_professors"("gym_id");

-- CreateIndex
CREATE INDEX "class_group_professors_class_group_id_idx" ON "class_group_professors"("class_group_id");

-- CreateIndex
CREATE INDEX "class_group_professors_professor_id_idx" ON "class_group_professors"("professor_id");

-- CreateIndex
CREATE INDEX "class_group_professors_gym_id_class_group_id_idx" ON "class_group_professors"("gym_id", "class_group_id");

-- CreateIndex
CREATE INDEX "class_group_professors_gym_id_professor_id_idx" ON "class_group_professors"("gym_id", "professor_id");

-- CreateIndex
CREATE INDEX "class_group_professors_class_group_id_role_idx" ON "class_group_professors"("class_group_id", "role");

-- CreateIndex
CREATE UNIQUE INDEX "uk_class_group_professors_group_professor" ON "class_group_professors"("class_group_id", "professor_id");

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_group_professors" ADD CONSTRAINT "class_group_professors_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_group_professors" ADD CONSTRAINT "class_group_professors_class_group_id_fkey" FOREIGN KEY ("class_group_id") REFERENCES "class_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_group_professors" ADD CONSTRAINT "class_group_professors_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
