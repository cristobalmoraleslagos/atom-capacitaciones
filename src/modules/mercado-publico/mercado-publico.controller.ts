import { Controller, Get, Post, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { MercadoPublicoService } from './mercado-publico.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('api/v1/tenders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class MercadoPublicoController {
  constructor(private readonly mercadoPublicoService: MercadoPublicoService) {}

  @Get()
  getTenders(@Query('status') status?: string) {
    return this.mercadoPublicoService.getTenders(status);
  }

  @Post('run')
  runManual() {
    return this.mercadoPublicoService.runManual();
  }

  @Get('export')
  async exportExcel(@Res() res: Response, @Query('status') status?: string) {
    const tenders = await this.mercadoPublicoService.getTenders(status);
    const buffer = this.mercadoPublicoService.exportExcel(tenders);

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="licitaciones_atom_${new Date().toISOString().slice(0, 10)}.xlsx"`,
    });
    res.send(buffer);
  }
}
