import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateSecurityJobDto {
  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @IsNotEmpty()
  @IsString()
  jobTitle: string;

  @IsNotEmpty()
  @IsString()
  jobType: string;

  @IsNotEmpty()
  @IsString()
  industryCategory: string;

  @IsNotEmpty()
  @IsString()
  region: string;

  @IsNotEmpty()
  @IsString()
  postcode: string;

  @IsNotEmpty()
  @IsNumber()
  salaryRate: number;

  @IsNotEmpty()
  @IsString()
  salaryType: string;

  @IsNotEmpty()
  @IsString()
  jobDescription: string;

  @IsNotEmpty()
  @IsString()
  requiredExperience: string;

  @IsOptional()
  @IsString()
  requiredLicences?: string;

  @IsOptional()
  @IsString()
  shiftAndHours?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
