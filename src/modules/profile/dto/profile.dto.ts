import { IsOptional, IsString, IsObject, IsArray } from 'class-validator';

export class ProfileDto {
  @IsObject()
  profileData: any;

  @IsOptional()
  @IsObject()
  permissions?: any;
}
