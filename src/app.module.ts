import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './chat/chat.module';
import { ChatController } from './chat/chat-controller';
import { ChatService } from './chat/chat-service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // makes ConfigService available throughout the app
    }),
    ChatModule],
  controllers: [AppController, ChatController],
  providers: [AppService, ChatService],
})
export class AppModule {}
