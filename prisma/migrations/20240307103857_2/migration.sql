/*
  Warnings:

  - Changed the type of `timestamp` on the `measurement` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "measurement" DROP COLUMN "timestamp",
ADD COLUMN     "timestamp" BIGINT NOT NULL;
