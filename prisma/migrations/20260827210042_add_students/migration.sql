-- CreateTable
CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "user_id" UUID,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "birth_date" DATE,
    "emergency_contact" VARCHAR(150),
    "emergency_phone" VARCHAR(30),
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_gym_id_idx" ON "students"("gym_id");

-- CreateIndex
CREATE INDEX "students_gym_id_active_idx" ON "students"("gym_id", "active");

-- CreateIndex
CREATE INDEX "students_gym_id_name_idx" ON "students"("gym_id", "name");

-- CreateIndex
CREATE INDEX "students_user_id_idx" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_students_gym_user" ON "students"("gym_id", "user_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
