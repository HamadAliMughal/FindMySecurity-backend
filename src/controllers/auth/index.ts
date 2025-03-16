import { prisma } from "../../bootstrap";
import { Body, Post, Route, Tags } from "tsoa";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.SESSION_SECRET || "";

@Route("/api/auth")
@Tags("Authentication")
export default class Auth {

  @Post("/register")
  public async registerUser(@Body() req: any): Promise<any> {
    const { email, password, roleId, profileData, companyData, providerData, ...data } = req;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) throw new Error("Email already exists");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate role existence
    const role = await prisma.role.findUnique({ where: { id: Number(roleId) } });
    if (!role) throw new Error("Invalid role");

    // Create user (this will run in parallel with role-specific data creation)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: Number(roleId),
        ...data,
      },
    });

    // Define promises for role-specific creation
    const roleSpecificDataPromises: Promise<any>[] = [];

    if (role.name === "IndividualProfessional") {
      roleSpecificDataPromises.push(
        prisma.individualProfessional.create({
          data: { userId: user.id, profileData: profileData || {} },
        })
      );
    } else if (role.name === "SecurityCompany") {
      roleSpecificDataPromises.push(
        prisma.securityCompany.create({
          data: { userId: user.id, companyData: companyData || null },
        })
      );
    } else if (role.name === "CourseProvider") {
      roleSpecificDataPromises.push(
        prisma.courseProvider.create({
          data: { userId: user.id, providerData: providerData || null },
        })
      );
    }

    // Run all role-specific data creation in parallel
    await Promise.all(roleSpecificDataPromises);

    // Optionally fetch the user with their related data (only if necessary)
    const userWithRole = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        role: { include: { permissions: true } },
        individualProfessional: role.name === "IndividualProfessional" ? true : false,
        securityCompany: role.name === "SecurityCompany" ? true : false,
        courseProvider: role.name === "CourseProvider" ? true : false,
      },
    });

    if (!userWithRole) throw new Error("User not found");

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "168h",
    });

    // Return the user data along with the token
    return { ...userWithRole, token };
  }



}
