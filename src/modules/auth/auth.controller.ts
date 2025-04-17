import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sendEmail')
  async sendEmail(@Body() body) {
    const { to } = body;
    return this.authService.sendEmail(to);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('check-email')
  async checkEmail(@Query('email') email: string) {
    return this.authService.checkEmail(email);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('login/verify')
  async verify(@Body() verifyDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyDto);
  }
  @Get('get-user/:id')
  async getUserDetails(@Param('id') id: number) {
    return this.authService.getUserDetails(+id);
  }
}
