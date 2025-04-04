import { prisma } from "../../bootstrap";
import { Body, Get, Post, Query, Route, Tags } from "tsoa";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginRequest } from "./types";
import twilio from "twilio";
// import { sendVerificationSMS } from "../../utils/sendsms";

const JWT_SECRET = process.env.SESSION_SECRET || "";
const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
const authToken = process.env.TWILIO_AUTH_TOKEN as string;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER as string;

const client = twilio(accountSid, authToken);
@Route("/api/auth")
@Tags("Authentication")
export default class Auth {

    @Post("/register")
    public async registerUser(@Body() req: any): Promise<any> {
        const { email, password, roleId, permissions, profileData, companyData, serviceRequirements, securityServicesOfferings, ...data } = req;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (existingUser) throw new Error("Email already exists");

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Validate role existence
        const role = await prisma.role.findUnique({
            where: { id: Number(roleId) },
            include: { permissions: { include: { permission: true } } } // Fetch role permissions
        });
        if (!role) throw new Error("Invalid role");

        // Begin transaction to create user and related data
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    roleId: Number(roleId),
                    ...data, // firstName, lastName, etc.
                },
            });

            // Assign role to user in RoleUser table
            await tx.roleUser.create({
                data: {
                    userId: user.id,
                    roleId: role.id,
                },
            });

            // Create role-specific entries
            switch (role.name) {
                case "Client":
                    await tx.client.create({
                        data: { userId: user.id, permissions: permissions || {} },
                    });
                    break;

                case "IndividualProfessional":
                    await tx.individualProfessional.create({
                        data: { userId: user.id, profileData: profileData || {}, permissions: permissions || {} },
                    });
                    break;

                case "SecurityCompany":
                    await tx.securityCompany.create({
                        data: {
                            userId: user.id,
                            companyName: companyData.companyName,
                            registrationNumber: companyData.registrationNumber,
                            businessAddress: companyData.businessAddress,
                            postCode: companyData.postCode,
                            contactPerson: companyData.contactPerson,
                            jobTitle: companyData.jobTitle,
                            phoneNumber: companyData.phoneNumber,
                            website: companyData.website || null,
                            servicesRequirements: serviceRequirements || [],
                            securityServicesOfferings: securityServicesOfferings || [],
                            permissions: permissions || {},
                        },
                    });
                    break;

                case "CourseProvider":
                    await tx.courseProvider.create({
                        data: {
                            userId: user.id,
                            companyName: companyData.companyName,
                            registrationNumber: companyData.registrationNumber,
                            businessAddress: companyData.businessAddress,
                            postCode: companyData.postCode,
                            contactPerson: companyData.contactPerson,
                            jobTitle: companyData.jobTitle,
                            phoneNumber: companyData.phoneNumber,
                            website: companyData.website || null,
                            servicesRequirements: serviceRequirements || [],
                            securityServicesOfferings: securityServicesOfferings || [],
                            permissions: permissions || {},
                        },
                    });
                    break;

                case "CorporateClient":
                    await tx.corporateClient.create({
                        data: {
                            userId: user.id,
                            companyName: companyData.companyName,
                            registrationNumber: companyData.registrationNumber,
                            address: companyData.address,
                            postCode: companyData.postCode,
                            industryType: companyData.industryType,
                            contactPerson: companyData.contactPerson,
                            jobTitle: companyData.jobTitle,
                            phoneNumber: companyData.phoneNumber,
                            website: companyData.website || null,
                            serviceRequirements: serviceRequirements || [],
                            permissions: permissions || {},
                        },
                    });
                    break;
            }

            // Return user with role and permissions (excluding password)
            return {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                screenName: user.screenName,
                phoneNumber: user?.phoneNumber,
                dateOfBirth: user.dateOfBirth,
                address: user.address,
                role: {
                    id: role.id,
                    name: role.name,
                    permissions: role.permissions.map((p) => p.permission.name),
                },
            };
        });

        // Generate JWT token
        const token = jwt.sign({ id: result.id, email: result.email }, JWT_SECRET, {
            expiresIn: "168h",
        });

        return { ...result, token };
    }
    @Get("/check-email")
    public async checkEmail(@Query("email") email: string): Promise<{ available: boolean; message?: string }> {
        if (!email) return { available: false, message: "Email is required" };

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return { available: false, message: "Email already exists. Try another one." };
        }

        return { available: true, message: "Email is available!" };
    }
    @Post("/login")
    public async loginUser(@Body() req: LoginRequest): Promise<{ code: string, message: string }> {
        const user = await prisma.user.findFirst({
            where: { email: req.email },
        });

        if (!user) throw new Error("Invalid email");


        const isPasswordValid = await bcrypt.compare(req.password, user.password);
        if (!isPasswordValid) throw new Error("Invalid password");


        // Send the verification code via email
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

        await prisma.verificationCode.upsert({
            where: { userId: user.id },
            update: { code: verificationCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
            create: { userId: user.id, code: verificationCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
        });
        // console.log("verification code", verificationCode)

        try {
            await client.messages.create({
                body: `Your verification code is: ${verificationCode}`,
                from: twilioPhoneNumber,
                to: '+923016623044',
            });
        } catch (error) {
            console.error("Error sending SMS:", error);
            throw error;
        }
        // await sendVerificationSMS('+923016623044', verificationCode);

        return { code: verificationCode, message: "Verification code sent to your phone number" };
    }

    @Post("/login/verify")
    public async verifyCode(
        @Body() req: { email: string; code: string }
    ): Promise<any> {
        const user = await prisma.user.findFirst({
            where: { email: req.email }
        });
        if (!user) throw new Error("Invalid email");

        const verificationRecord = await prisma.verificationCode.findFirst({
            where: { userId: user.id, code: req.code },
        });

        if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
            throw new Error("Invalid or expired verification code");
        }

        // Delete the verification record after use
        await prisma.verificationCode.delete({ where: { id: verificationRecord.id } });
        const role = await prisma.role.findUnique({
            where: { id: Number(user?.roleId) },
            include: { permissions: { include: { permission: true } } } // Fetch role permissions
        });

        if (!role) throw new Error("Invalid role");
        // Generate JWT token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "168h",
        });

        const returnUser: any = {
            ...user, role: {
                id: user?.roleId,
                roleName: role?.name,
                permissions: role.permissions.map((p) => p.permission.name),
            },
        };
        if (returnUser.password) delete returnUser.password;

        return { ...returnUser, token };
    }




}
