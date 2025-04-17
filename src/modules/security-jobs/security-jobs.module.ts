import { Module } from '@nestjs/common';
import { SecurityJobsService } from './security-jobs.service';
import { SecurityJobsController } from './security-jobs.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SecurityJobsController],
  providers: [SecurityJobsService],
})
export class SecurityJobsModule {}
