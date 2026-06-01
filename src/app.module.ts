import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SocialMediaModule } from './modules/social-media/social-media.module';
import { ProfessorModule } from './modules/professor/professor.module';
import { MercadoPublicoModule } from './modules/mercado-publico/mercado-publico.module';
import { LobbyistModule } from './modules/lobbyist/lobbyist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    FinanceModule,
    SocialMediaModule,
    ProfessorModule,
    MercadoPublicoModule,
    LobbyistModule,
  ],
})
export class AppModule {}
