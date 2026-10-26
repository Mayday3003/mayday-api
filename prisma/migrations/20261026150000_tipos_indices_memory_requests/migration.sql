-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('pendiente', 'aprobada', 'rechazada');

-- AlterTable: tamaños de columna
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(150);

-- AlterTable: un recuerdo es un día, no una hora
ALTER TABLE "experiences" ALTER COLUMN "title" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "date" SET DATA TYPE DATE;

-- CreateTable
CREATE TABLE "memory_requests" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "type" "ExperienceType" NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "date" DATE,
    "participants" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "RequestStatus" NOT NULL DEFAULT 'pendiente',
    "user_id" TEXT NOT NULL,
    "experience_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memory_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "experiences_type_idx" ON "experiences"("type");
CREATE INDEX "interactions_user_id_idx" ON "interactions"("user_id");
CREATE INDEX "interactions_experience_id_idx" ON "interactions"("experience_id");
CREATE UNIQUE INDEX "memory_requests_experience_id_key" ON "memory_requests"("experience_id");
CREATE INDEX "memory_requests_user_id_idx" ON "memory_requests"("user_id");
CREATE INDEX "memory_requests_status_idx" ON "memory_requests"("status");

-- AddForeignKey
ALTER TABLE "memory_requests" ADD CONSTRAINT "memory_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "memory_requests" ADD CONSTRAINT "memory_requests_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "experiences"("id") ON DELETE SET NULL ON UPDATE CASCADE;
