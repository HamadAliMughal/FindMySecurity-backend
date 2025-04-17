import { PartialType } from '@nestjs/mapped-types';
import { CreateSecurityJobDto } from './create-security-job.dto';

export class UpdateSecurityJobDto extends PartialType(CreateSecurityJobDto) {}
