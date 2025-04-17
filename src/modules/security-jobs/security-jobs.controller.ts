import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { SecurityJobsService } from './security-jobs.service';
import { CreateSecurityJobDto } from './dto/create-security-job.dto';
import { UpdateSecurityJobDto } from './dto/update-security-job.dto';

@Controller('security-jobs')
export class SecurityJobsController {
  constructor(private readonly securityJobsService: SecurityJobsService) {}

  @Post()
  async create(@Body() createSecurityJobDto: CreateSecurityJobDto) {
    const jobAd = await this.securityJobsService.create(createSecurityJobDto);
    return {
      success: true,
      jobAd,
      message: 'Security job advertisement created successfully',
    };
  }

  @Get()
  async findAll() {
    const jobs = await this.securityJobsService.findAll();
    return {
      success: true,
      jobs,
      message: 'Successfully fetched all security job advertisements',
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const jobAd = await this.securityJobsService.findOne(id);
    return {
      success: true,
      jobAd,
      message: 'Successfully fetched security job advertisement',
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSecurityJobDto: UpdateSecurityJobDto,
  ) {
    const jobAd = await this.securityJobsService.update(
      id,
      updateSecurityJobDto,
    );
    return {
      success: true,
      jobAd,
      message: 'Security job advertisement updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.securityJobsService.remove(id);
    return {
      success: true,
      message: 'Security job advertisement deleted successfully',
    };
  }
}
