-- CreateTable
CREATE TABLE "graduations" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "modality_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "text_color" VARCHAR(7),
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "graduations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "graduations_gym_id_idx" ON "graduations"("gym_id");

-- CreateIndex
CREATE INDEX "graduations_modality_id_idx" ON "graduations"("modality_id");

-- CreateIndex
CREATE INDEX "graduations_gym_id_modality_id_idx" ON "graduations"("gym_id", "modality_id");

-- CreateIndex
CREATE INDEX "graduations_gym_id_modality_id_active_idx" ON "graduations"("gym_id", "modality_id", "active");

-- CreateIndex
CREATE INDEX "graduations_gym_id_modality_id_order_idx" ON "graduations"("gym_id", "modality_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "uk_graduations_gym_modality_name" ON "graduations"("gym_id", "modality_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "uk_graduations_gym_modality_order" ON "graduations"("gym_id", "modality_id", "order");

-- AddForeignKey
ALTER TABLE "graduations" ADD CONSTRAINT "graduations_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "graduations" ADD CONSTRAINT "graduations_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
