-- CreateTable
CREATE TABLE "professor_modalities" (
    "id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "professor_id" UUID NOT NULL,
    "modality_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "professor_modalities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "professor_modalities_gym_id_idx" ON "professor_modalities"("gym_id");

-- CreateIndex
CREATE INDEX "professor_modalities_professor_id_idx" ON "professor_modalities"("professor_id");

-- CreateIndex
CREATE INDEX "professor_modalities_modality_id_idx" ON "professor_modalities"("modality_id");

-- CreateIndex
CREATE INDEX "professor_modalities_gym_id_professor_id_idx" ON "professor_modalities"("gym_id", "professor_id");

-- CreateIndex
CREATE INDEX "professor_modalities_gym_id_modality_id_idx" ON "professor_modalities"("gym_id", "modality_id");

-- CreateIndex
CREATE UNIQUE INDEX "uk_professor_modalities_professor_modality" ON "professor_modalities"("professor_id", "modality_id");

-- AddForeignKey
ALTER TABLE "professor_modalities" ADD CONSTRAINT "professor_modalities_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_modalities" ADD CONSTRAINT "professor_modalities_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Professor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professor_modalities" ADD CONSTRAINT "professor_modalities_modality_id_fkey" FOREIGN KEY ("modality_id") REFERENCES "modalities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
