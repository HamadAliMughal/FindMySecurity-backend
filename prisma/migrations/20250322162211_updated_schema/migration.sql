/*
  Warnings:

  - You are about to drop the column `corporateData` on the `CorporateClient` table. All the data in the column will be lost.
  - You are about to drop the column `providerData` on the `CourseProvider` table. All the data in the column will be lost.
  - You are about to drop the column `companyData` on the `SecurityCompany` table. All the data in the column will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RolePermissions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPerson` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `industryType` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postCode` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumber` to the `CorporateClient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessAddress` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPerson` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postCode` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumber` to the `CourseProvider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permissions` to the `Role` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessAddress` to the `SecurityCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `SecurityCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactPerson` to the `SecurityCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `SecurityCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `SecurityCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postCode` to the `SecurityCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registrationNumber` to the `SecurityCompany` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_A_fkey";

-- DropForeignKey
ALTER TABLE "_RolePermissions" DROP CONSTRAINT "_RolePermissions_B_fkey";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "CorporateClient" DROP COLUMN "corporateData",
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactPerson" TEXT NOT NULL,
ADD COLUMN     "industryType" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "postCode" TEXT NOT NULL,
ADD COLUMN     "registrationNumber" TEXT NOT NULL,
ADD COLUMN     "serviceRequirements" JSONB,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "CourseProvider" DROP COLUMN "providerData",
ADD COLUMN     "businessAddress" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactPerson" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "postCode" TEXT NOT NULL,
ADD COLUMN     "registrationNumber" TEXT NOT NULL,
ADD COLUMN     "securityServicesOfferings" JSONB,
ADD COLUMN     "servicesRequirements" JSONB,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "IndividualProfessional" ADD COLUMN     "permissions" JSONB;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "permissions" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SecurityCompany" DROP COLUMN "companyData",
ADD COLUMN     "businessAddress" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactPerson" TEXT NOT NULL,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "permissions" JSONB,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "postCode" TEXT NOT NULL,
ADD COLUMN     "registrationNumber" TEXT NOT NULL,
ADD COLUMN     "securityServicesOfferings" JSONB,
ADD COLUMN     "servicesRequirements" JSONB,
ADD COLUMN     "website" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "screenName" TEXT;

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "_RolePermissions";
