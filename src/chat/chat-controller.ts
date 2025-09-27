// src/chat/chat.controller.ts
import { Controller, Post, Body, ValidationPipe, UsePipes } from '@nestjs/common';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatService } from './chat-service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // POST /chat  { "message": "hello" }
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async postMessage(@Body() body: ChatRequestDto) {
    const { message } = body;
    const reply = await this.chatService.sendToGemini(message);
    return { reply };
  }
}

