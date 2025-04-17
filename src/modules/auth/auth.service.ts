import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { SesService } from '../../email/ses.service';
const JWT_SECRET = process.env.SESSION_SECRET || '';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sesService: SesService,
  ) { }

  async sendEmail(to: string) {
    const otpEmailHtml = `<p>Your verification code is: <strong>9345</strong></p>`;
    await this.sesService.sendEmail(to, 'Your OTP Code', otpEmailHtml);
  }

  async register(dto: RegisterDto) {
    const {
      email,
      password,
      roleId,
      permissions,
      profileData,
      companyData,
      serviceRequirements,
      securityServicesOfferings,
      membershipPlan = 'basic',
      ...data
    } = dto;

    const existingUser = await this.prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const role = await this.prisma.role.findUnique({
      where: { id: Number(roleId) },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) throw new BadRequestException('Invalid role');

    const user = await this.prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          roleId: Number(roleId),
          validated: false,
          ...(data as any),
        },
      });

      await tx.roleUser.create({
        data: {
          userId: user.id,
          roleId: role.id,
        },
      });

      let profile: any = null;

      switch (role.name) {
        case 'Client':
          profile = await tx.client.create({
            data: {
              userId: user.id,
              permissions: permissions || {},
            },
          });
          break;

        case 'IndividualProfessional':
          profile = await tx.individualProfessional.create({
            data: {
              userId: user.id,
              profileData: profileData || {},
              permissions: permissions || {},
            },
          });
          break;

        case 'SecurityCompany':
          profile = await tx.securityCompany.create({
            data: {
              userId: user.id,
              ...(companyData as any),
              servicesRequirements: serviceRequirements || [],
              securityServicesOfferings: securityServicesOfferings || [],
              permissions: permissions || {},
            },
          });
          break;

        case 'CourseProvider':
          profile = await tx.courseProvider.create({
            data: {
              userId: user.id,
              ...(companyData as any),
              servicesRequirements: serviceRequirements || [],
              securityServicesOfferings: securityServicesOfferings || [],
              permissions: permissions || {},
            },
          });
          break;

        case 'CorporateClient':
          profile = await tx.corporateClient.create({
            data: {
              userId: user.id,
              ...(companyData as any),
              serviceRequirements: serviceRequirements || [],
              permissions: permissions || {},
            },
          });
          break;
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        screenName: user.screenName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        validated: user.validated,
        role: {
          id: role.id,
          name: role.name,
          permissions: role.permissions.map((p: any) => p.permission.name),
        },
        profile,
      };
    });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.verificationCode.upsert({
      where: { userId: user.id },
      update: {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      create: {
        userId: user.id,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    const otpEmailHtml = `<p>Your verification code is: <strong>${verificationCode}</strong></p>`;
    await this.sesService.sendEmail(user.email, 'Your OTP Code', otpEmailHtml);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '168h',
    });

    return {
      ...user,
      message: 'Registration successful. Please verify your email.',
      token,
    };
  }


  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid email');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    await this.prisma.verificationCode.upsert({
      where: { userId: user.id },
      update: {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      create: {
        userId: user.id,
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // You can integrate SMS/email sending here
    return { code: verificationCode, message: 'Verification code sent' };
  }

  async verifyCode(dto: VerifyCodeDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid email');

    const verification = await this.prisma.verificationCode.findFirst({
      where: { userId: user.id, code: dto.code },
    });

    if (!verification || verification.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    // Delete the verification code
    await this.prisma.verificationCode.delete({
      where: { id: verification.id },
    });

    // Update user as validated
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { validated: true },
    });

    const role = await this.prisma.role.findUnique({
      where: { id: Number(updatedUser.roleId) },
      include: { permissions: { include: { permission: true } } },
    });

    if (!role) throw new BadRequestException('Invalid role');

    const token = jwt.sign(
      { id: updatedUser.id, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '168h' },
    );

    const returnUser = {
      ...updatedUser,
      role: {
        id: updatedUser.roleId,
        roleName: role.name,
        permissions: role.permissions.map((p: any) => p.permission.name),
      },
    };

    delete returnUser.password;
    return {
      ...returnUser,
      token,
      message: 'Verification successful. You are now logged in.',
    };
  }

  async checkEmail(email: string) {
    if (!email) return { available: false, message: 'Email is required' };

    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing)
      return {
        available: false,
        message: 'Email already exists. Try another one.',
      };

    return { available: true, message: 'Email is available!' };
  }
  async getUserDetails(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        client: true,
        individualProfessional: true,
        securityCompany: true,
        courseProvider: true,
        corporateClient: true,
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const { password, ...userWithoutPassword } = user;

    let additionalData = null;

    switch (user.role.name) {
      case 'Client':
        additionalData = user.client;
        break;
      case 'IndividualProfessional':
        additionalData = user.individualProfessional;
        break;
      case 'SecurityCompany':
        additionalData = user.securityCompany;
        break;
      case 'CourseProvider':
        additionalData = user.courseProvider;
        break;
      case 'CorporateClient':
        additionalData = user.corporateClient;
        break;
      default:
        additionalData = {};
    }

    return { ...userWithoutPassword, role: user.role.name, additionalData };
  }
}
