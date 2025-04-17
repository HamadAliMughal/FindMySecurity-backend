import { IsString, IsEmail, MinLength } from 'class-validator';

export class VerifyCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Code must be at least 6 characters long' })
  code: string;
}
