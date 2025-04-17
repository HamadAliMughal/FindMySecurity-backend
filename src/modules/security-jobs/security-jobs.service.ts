import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSecurityJobDto } from './dto/create-security-job.dto';
import { UpdateSecurityJobDto } from './dto/update-security-job.dto';

@Injectable()
export class SecurityJobsService {
  constructor(private prisma: PrismaService) {}

  async create(createSecurityJobDto: CreateSecurityJobDto) {
    const jobAd = await this.prisma.serviceAd.create({
      data: {
        ...createSecurityJobDto,
        salaryRate: Number(createSecurityJobDto.salaryRate),
        startDate: new Date(createSecurityJobDto.startDate),
        deadline: new Date(createSecurityJobDto.deadline),
      },
      include: {
        company: true,
      },
    });
    return jobAd;
  }

  async findAll() {
    return this.prisma.serviceAd.findMany({
      include: {
        company: true,
      },
    });
  }

  async findOne(id: number) {
    const jobAd = await this.prisma.serviceAd.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!jobAd) {
      throw new NotFoundException('Security job advertisement not found');
    }

    return jobAd;
  }

  async update(id: number, updateSecurityJobDto: UpdateSecurityJobDto) {
    const existing = await this.prisma.serviceAd.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Security job advertisement not found');
    }

    return this.prisma.serviceAd.update({
      where: { id },
      data: {
        ...updateSecurityJobDto,
        salaryRate: updateSecurityJobDto.salaryRate
          ? Number(updateSecurityJobDto.salaryRate)
          : undefined,
      },
      include: {
        company: true,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.serviceAd.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Security job advertisement not found');
    }

    await this.prisma.serviceAd.delete({
      where: { id },
    });
  }
}
