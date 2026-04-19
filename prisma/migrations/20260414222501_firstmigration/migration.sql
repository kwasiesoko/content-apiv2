-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CLIENT', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(300) NOT NULL,
    "last_name" VARCHAR(300) NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "preferred_language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "sso_user_id" TEXT NOT NULL,
    "user_type" "UserType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_sso_user_id_key" ON "User"("sso_user_id");
