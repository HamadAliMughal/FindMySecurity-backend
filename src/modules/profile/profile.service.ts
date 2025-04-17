import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  public async updateIndividualProfile(userId: number, req: ProfileDto) {
    const { profileData, permissions } = req;

    const existingProfile = await this.prisma.individualProfessional.findUnique(
      {
        where: { userId },
      },
    );

    if (!existingProfile) {
      throw new Error('Profile not found.');
    }

    await this.prisma.individualProfessional.update({
      where: { userId },
      data: {
        profileData,
        permissions,
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        individualProfessional: true,
      },
    });

    if (!user) {
      throw new Error('User not found after profile update.');
    }

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: 'Profile updated successfully.',
      user: userWithoutPassword,
    };
  }
}
