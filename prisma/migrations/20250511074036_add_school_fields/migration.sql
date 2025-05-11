/*
  Warnings:

  - You are about to drop the column `category` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `contacts` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `coordinates` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `School` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrl` on the `School` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_School" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "additionalPhones" TEXT,
    "faxNumber" TEXT,
    "messengers" TEXT,
    "workingHours" TEXT,
    "socialNetworks" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "externalReviewsUrl" TEXT,
    "externalReviewsSource" TEXT,
    "externalReviewsId" TEXT,
    "images" TEXT,
    "educationalPrograms" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_School" ("address", "createdAt", "description", "email", "id", "logoUrl", "name", "updatedAt") SELECT "address", "createdAt", "description", "email", "id", "logoUrl", "name", "updatedAt" FROM "School";
DROP TABLE "School";
ALTER TABLE "new_School" RENAME TO "School";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
