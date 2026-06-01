import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MercadoPublicoController } from './mercado-publico.controller';
import { MercadoPublicoService } from './mercado-publico.service';

@Module({
  imports: [HttpModule],
  controllers: [MercadoPublicoController],
  providers: [MercadoPublicoService],
})
export class MercadoPublicoModule {}
