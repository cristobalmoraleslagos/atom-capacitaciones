import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { LobbyistService } from './lobbyist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/lobby')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LobbyistController {
  constructor(private readonly lobbyistService: LobbyistService) {}

  @Get('minutes')
  @Roles('ADMIN', 'LOBBYIST')
  getMyMinutes(@Request() req: any) {
    if (req.user.role === 'ADMIN') return this.lobbyistService.getAllMinutes();
    return this.lobbyistService.getMinutes(req.user.id);
  }

  @Post('minutes')
  @Roles('ADMIN', 'LOBBYIST')
  createMinute(@Body() body: any, @Request() req: any) {
    return this.lobbyistService.createMinute({ ...body, lobbyistId: req.user.id });
  }

  @Patch('minutes/:id/status')
  @Roles('ADMIN', 'LOBBYIST')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.lobbyistService.updateStatus(id, body.status);
  }

  @Get('tracking')
  @Roles('ADMIN', 'LOBBYIST')
  getTrackingTable() {
    return this.lobbyistService.getTrackingTable();
  }
}
