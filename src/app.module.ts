import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { SecurityJobsModule } from './modules/security-jobs/security-jobs.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './email/email.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    SecurityJobsModule,
    AuthModule,
    ProfileModule,
    EmailModule,
  ],
})
export class AppModule {}
