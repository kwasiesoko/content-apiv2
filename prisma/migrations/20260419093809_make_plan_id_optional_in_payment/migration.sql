-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_plan_id_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "plan_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
