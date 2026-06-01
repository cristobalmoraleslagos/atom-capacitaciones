import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'FINANCE')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('dashboard')
  getDashboard() {
    return this.financeService.getDashboard();
  }

  @Get('period')
  getByPeriod(@Query('q') period: string) {
    return this.financeService.getByPeriod(period);
  }

  @Post('record')
  createRecord(@Body() body: any, @Request() req: any) {
    return this.financeService.createRecord({ ...body, generatedBy: req.user.email });
  }
}
