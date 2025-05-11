/*
  Warnings:

  - You are about to drop the `ExamRequirement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `rating` on the `Review` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- AlterTable
ALTER TABLE "EducationalProgram" ADD COLUMN "category" TEXT;
ALTER TABLE "EducationalProgram" ADD COLUMN "examRequirements" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN "email" TEXT;
ALTER TABLE "School" ADD COLUMN "phone" TEXT;

-- AlterTable
ALTER TABLE "SchoolPhoto" ADD COLUMN "description" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ExamRequirement";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "authorName" TEXT,
    "source" TEXT,
    "isExternal" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "schoolId" INTEGER NOT NULL,
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Review" ("authorName", "createdAt", "id", "isApproved", "isExternal", "rating", "schoolId", "source", "text", "userId") SELECT "authorName", "createdAt", "id", "isApproved", "isExternal", "rating", "schoolId", "source", "text", "userId" FROM "Review";
DROP TABLE "Review";
ALTER TABLE "new_Review" RENAME TO "Review";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
