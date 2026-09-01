-- CreateTable
CREATE TABLE "Professor" (
    "id" UUID NOT NULL,
    "gymId" UUID NOT NULL,
    "userId" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "bio" TEXT,
    "notes" TEXT,
    "hireDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Professor_gymId_idx" ON "Professor"("gymId");

-- CreateIndex
CREATE INDEX "Professor_gymId_active_idx" ON "Professor"("gymId", "active");

-- CreateIndex
CREATE INDEX "Professor_gymId_name_idx" ON "Professor"("gymId", "name");

-- CreateIndex
CREATE INDEX "Professor_userId_idx" ON "Professor"("userId");

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "gyms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
