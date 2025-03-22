import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function createAdminUser(email: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the Admin role exists
    const adminRole = await prisma.role.findUnique({
      where: { name: "Admin" },
    });

    if (!adminRole) {
      throw new Error("Admin role does not exist. Please seed roles first.");
    }

    // Check if an admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return existingAdmin;
    }

    // Create the Admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: "Admin", // Required field
        lastName: "User", // Required field
        roleId: adminRole.id, // Assign Admin role
        phoneNumber: "1234567890", // Add a default phone number
      },
    });

    console.log("Admin user created successfully:", adminUser);
    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const permissions = [
    "BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE", "RESTRICTED_INTERACTION",
    "PROFILE_CREATION", "DOCUMENT_UPLOAD", "JOB_SEARCH", "JOB_APPLICATION_LIMIT",
    "MESSAGE_RESTRICTIONS", "INDIRECT_CONTACT", "JOB_NOTIFICATIONS", "LIMITED_COMMUNICATION",
    "PROFILE_VISIBILITY", "MANDATORY_DOCUMENTS", "DOCUMENT_CHECKS", "TRAINING_COURSE_SEARCH",
    "AVAILABILITY_CALENDAR", "PROFILE_UPDATES", "JOB_LISTINGS_APPLICATION", "PAY_PER_CLICK_ADS",
    "DOCUMENT_ACCESS_REQUESTS", "ACCESS_REQUEST_NOTIFICATIONS", "INSURANCE_BADGE",
    "UNLIMITED_JOB_APPLICATIONS", "DIRECT_MESSAGING", "ADVANCED_SEARCH_ACCESS",
    "PRIORITY_PROFILE_LISTING", "AI_MATCHING", "VERIFICATION_BADGE", "FULL_FEATURE_ACCESS",
    "AI_OPTIMIZATION", "PERSONALIZED_SUPPORT", "DOCUMENT_VERIFICATION_FAST_TRACK",
    "TRAINING_COURSE_ACCESS", "FULL_MESSAGING", "DOCUMENT_ACCESS", "JOB_AD_POSTING",
    "REVENUE_GENERATION", "COURSE_AD_PLACEMENT", "AI_FEATURES"
  ];

  console.log("Seeding permissions...");

  await prisma.permission.createMany({
    data: permissions.map(name => ({ name })),
    skipDuplicates: true, // Skip if the permission already exists
  });

  console.log("Permissions seeded successfully.");

  const rolePermissions = {
    "Admin": [
      "BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE",
      "PROFILE_CREATION", "DOCUMENT_UPLOAD", "JOB_SEARCH", "JOB_APPLICATION_LIMIT",
      "MESSAGE_RESTRICTIONS", "INDIRECT_CONTACT", "JOB_NOTIFICATIONS", "LIMITED_COMMUNICATION",
      "PROFILE_VISIBILITY", "MANDATORY_DOCUMENTS", "DOCUMENT_CHECKS", "TRAINING_COURSE_SEARCH",
      "AVAILABILITY_CALENDAR", "PROFILE_UPDATES", "JOB_LISTINGS_APPLICATION", "PAY_PER_CLICK_ADS",
      "DOCUMENT_ACCESS_REQUESTS", "ACCESS_REQUEST_NOTIFICATIONS", "INSURANCE_BADGE"
    ],
    "Unregistered": ["BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE", "RESTRICTED_INTERACTION"],
    "IndividualProfessional": [
      "BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE",
      "PROFILE_CREATION", "DOCUMENT_UPLOAD", "JOB_SEARCH", "JOB_APPLICATION_LIMIT",
      "MESSAGE_RESTRICTIONS", "INDIRECT_CONTACT", "JOB_NOTIFICATIONS", "LIMITED_COMMUNICATION",
      "PROFILE_VISIBILITY", "MANDATORY_DOCUMENTS", "DOCUMENT_CHECKS", "TRAINING_COURSE_SEARCH",
      "AVAILABILITY_CALENDAR", "PROFILE_UPDATES", "JOB_LISTINGS_APPLICATION", "PAY_PER_CLICK_ADS",
      "DOCUMENT_ACCESS_REQUESTS", "ACCESS_REQUEST_NOTIFICATIONS", "INSURANCE_BADGE"
    ],
    "Client": ["BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE", "JOB_AD_POSTING", "REVENUE_GENERATION"],
    "SecurityCompany": ["BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE", "FULL_MESSAGING", "DOCUMENT_ACCESS", "JOB_AD_POSTING", "PRIORITY_PROFILE_LISTING", "AI_FEATURES"],
    "CourseProvider": ["BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE", "COURSE_AD_PLACEMENT", "AI_FEATURES", "PRIORITY_PROFILE_LISTING"],
    "CorporateClient": ["BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE", "FULL_MESSAGING", "DOCUMENT_ACCESS", "JOB_AD_POSTING", "AI_FEATURES"],
  };

  console.log("Seeding roles and assigning permissions...");

  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    // Connect permissions to the role
    const permissionsToConnect = await prisma.permission.findMany({
      where: {
        name: {
          in: perms,
        },
      },
      select: { id: true },
    });

    await prisma.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          create: permissionsToConnect.map(permission => ({
            permissionId: permission.id,
          })),
        },
      },
    });
  }

  console.log("Roles and permissions linked successfully.");

  await createAdminUser("admin@findmysecurity.com", "Findsecurity1.");
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
