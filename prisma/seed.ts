import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

  // Use a transaction to upsert all permissions in one batch
  await prisma.permission.createMany({
    data: permissions.map(name => ({ name })),
    skipDuplicates: true, // Skip if the permission already exists
  });

  console.log("✅ Permissions seeded successfully.");

  const rolePermissions = {
    "Unregistered": ["BASIC_SEARCH", "ADVANCED_SEARCH", "BROWSE_MAIN_SITE", "RESTRICTED_INTERACTION"],
    "IndividualProfessional": [
      "PROFILE_CREATION", "DOCUMENT_UPLOAD", "JOB_SEARCH", "JOB_APPLICATION_LIMIT",
      "MESSAGE_RESTRICTIONS", "INDIRECT_CONTACT", "JOB_NOTIFICATIONS", "LIMITED_COMMUNICATION",
      "PROFILE_VISIBILITY", "MANDATORY_DOCUMENTS", "DOCUMENT_CHECKS", "TRAINING_COURSE_SEARCH",
      "AVAILABILITY_CALENDAR", "PROFILE_UPDATES", "JOB_LISTINGS_APPLICATION", "PAY_PER_CLICK_ADS",
      "DOCUMENT_ACCESS_REQUESTS", "ACCESS_REQUEST_NOTIFICATIONS", "INSURANCE_BADGE"
    ],
    "Client": ["JOB_AD_POSTING", "REVENUE_GENERATION"],
    "SecurityCompany": ["FULL_MESSAGING", "DOCUMENT_ACCESS", "JOB_AD_POSTING", "PRIORITY_PROFILE_LISTING", "AI_FEATURES"],
    "CourseProvider": ["COURSE_AD_PLACEMENT", "AI_FEATURES", "PRIORITY_PROFILE_LISTING"]
  };

  console.log("Seeding roles and linking permissions...");

  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    // Ensure role exists before connecting permissions
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    // Link permissions to the role
    await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            create: perms.map((name) => ({
              permission: {
                connect: { name },
              },
            })),
          },
        },
      });
      

    console.log(`✅ Role "${roleName}" with permissions linked.`);
  }

  console.log("✅ Roles and permissions linked successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
