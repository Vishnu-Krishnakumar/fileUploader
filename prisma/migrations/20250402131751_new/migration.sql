/*
  Warnings:

  - Added the required column `url` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "files" ADD COLUMN     "size" INTEGER,
ADD COLUMN     "url" TEXT NOT NULL;
