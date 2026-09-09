-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateTable
CREATE TABLE "class_schedules" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "class_group_id" UUID NOT NULL,
    "weekday" "Weekday" NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,
    "room" VARCHAR(150),
    "notes" TEXT,
    "valid_from" DATE,
    "valid_until" DATE,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "class_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_schedules_gym_id_idx" ON "class_schedules"("gym_id");

-- CreateIndex
CREATE INDEX "class_schedules_class_group_id_idx" ON "class_schedules"("class_group_id");

-- CreateIndex
CREATE INDEX "class_schedules_gym_id_active_idx" ON "class_schedules"("gym_id", "active");

-- CreateIndex
CREATE INDEX "class_schedules_gym_id_weekday_idx" ON "class_schedules"("gym_id", "weekday");

-- CreateIndex
CREATE INDEX "class_schedules_gym_id_weekday_active_idx" ON "class_schedules"("gym_id", "weekday", "active");

-- CreateIndex
CREATE INDEX "class_schedules_gym_id_class_group_id_idx" ON "class_schedules"("gym_id", "class_group_id");

-- CreateIndex
CREATE INDEX "class_schedules_gym_id_class_group_id_active_idx" ON "class_schedules"("gym_id", "class_group_id", "active");

-- CreateIndex
CREATE INDEX "class_schedules_gym_id_room_idx" ON "class_schedules"("gym_id", "room");

-- CreateIndex
CREATE INDEX "class_schedules_valid_from_idx" ON "class_schedules"("valid_from");

-- CreateIndex
CREATE INDEX "class_schedules_valid_until_idx" ON "class_schedules"("valid_until");

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_schedules" ADD CONSTRAINT "class_schedules_class_group_id_fkey" FOREIGN KEY ("class_group_id") REFERENCES "class_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
