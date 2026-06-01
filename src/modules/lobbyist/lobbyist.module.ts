import { Module } from '@nestjs/common';
import { LobbyistController } from './lobbyist.controller';
import { LobbyistService } from './lobbyist.service';

@Module({
  controllers: [LobbyistController],
  providers: [LobbyistService],
})
export class LobbyistModule {}
