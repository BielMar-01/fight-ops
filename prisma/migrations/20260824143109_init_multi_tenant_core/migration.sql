-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('USER', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "GymRole" AS ENUM ('OWNER', 'ADMIN', 'RECEPTIONIST', 'PROFESSOR', 'STUDENT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30),
    "avatar_url" TEXT,
    "global_role" "GlobalRole" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gyms" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "logo_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gyms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gym_memberships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "gym_id" UUID NOT NULL,
    "role" "GymRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gym_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_active_idx" ON "users"("active");

-- CreateIndex
CREATE INDEX "users_global_role_idx" ON "users"("global_role");

-- CreateIndex
CREATE UNIQUE INDEX "gyms_slug_key" ON "gyms"("slug");

-- CreateIndex
CREATE INDEX "gyms_active_idx" ON "gyms"("active");

-- CreateIndex
CREATE INDEX "gyms_created_at_idx" ON "gyms"("created_at");

-- CreateIndex
CREATE INDEX "gym_memberships_user_id_idx" ON "gym_memberships"("user_id");

-- CreateIndex
CREATE INDEX "gym_memberships_gym_id_idx" ON "gym_memberships"("gym_id");

-- CreateIndex
CREATE INDEX "gym_memberships_gym_id_role_idx" ON "gym_memberships"("gym_id", "role");

-- CreateIndex
CREATE INDEX "gym_memberships_gym_id_active_idx" ON "gym_memberships"("gym_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "uk_gym_memberships_user_gym" ON "gym_memberships"("user_id", "gym_id");

-- AddForeignKey
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gym_memberships" ADD CONSTRAINT "gym_memberships_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "gyms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
