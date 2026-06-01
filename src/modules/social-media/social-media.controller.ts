import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SocialMediaService } from './social-media.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/social')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SocialMediaController {
  constructor(private readonly socialMediaService: SocialMediaService) {}

  @Get('metrics')
  @Roles('ADMIN', 'SOCIAL_MANAGER')
  getMetrics() {
    return this.socialMediaService.getMetrics();
  }

  @Post('metrics')
  @Roles('ADMIN', 'SOCIAL_MANAGER')
  upsertMetrics(@Body() body: any) {
    return this.socialMediaService.upsertMetrics(body);
  }

  @Get('campaigns')
  @Roles('ADMIN', 'SOCIAL_MANAGER')
  getCampaigns() {
    return this.socialMediaService.getCampaigns();
  }

  @Post('campaigns')
  @Roles('ADMIN', 'SOCIAL_MANAGER')
  createCampaign(@Body() body: any) {
    return this.socialMediaService.createCampaign(body);
  }

  @Get('content')
  @Roles('ADMIN', 'SOCIAL_MANAGER')
  getWeeklyContent() {
    return this.socialMediaService.getWeeklyContent();
  }

  @Post('content/generate')
  @Roles('ADMIN', 'SOCIAL_MANAGER')
  generateContent() {
    return this.socialMediaService.generarContenidoManual();
  }
}
