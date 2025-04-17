import { Body, Put, Query, Controller, Patch, Param } from '@nestjs/common';
import { ProfileDto } from './dto/profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Put('individual/:id') // using route param
  public async updateIndividualProfile(
    @Param('id') userId: number,
    @Body() req: ProfileDto,
  ) {
    return this.profileService.updateIndividualProfile(userId, req);
  }
}
