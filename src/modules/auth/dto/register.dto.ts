import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsObject,
  IsArray,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  roleId: number;

  @IsObject()
  @IsOptional()
  permissions?: Record<string, any>;

  @IsObject()
  @IsOptional()
  profileData?: Record<string, any>;

  @IsObject()
  @IsOptional()
  companyData?: Record<string, any>;

  @IsArray()
  @IsOptional()
  serviceRequirements?: any[];

  @IsArray()
  @IsOptional()
  securityServicesOfferings?: any[];

  @IsString()
  @IsOptional()
  screenName?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  membershipPlan?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
