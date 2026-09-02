-- CreateTable
CREATE TABLE "modalities" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "modalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "modalities_gym_id_idx" ON "modalities"("gym_id");

-- CreateIndex
CREATE INDEX "modalities_gym_id_active_idx" ON "modalities"("gym_id", "active");

-- CreateIndex
CREATE INDEX "modalities_gym_id_name_idx" ON "modalities"("gym_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "uk_modalities_gym_name" ON "modalities"("gym_id", "name");

-- AddForeignKey
ALTER TABLE "modalities" ADD CONSTRAINT "modalities_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
