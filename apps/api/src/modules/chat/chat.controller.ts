import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, CreateChatMessageDto } from '@cortex/shared';
import { ChatRole } from './entities/chat-message.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  async createSession(@Body() dto: CreateChatSessionDto) {
    return this.chatService.createSession();
  }

  @Get('sessions')
  async findAll() {
    return this.chatService.listSessions();
  }

  @Get('sessions/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.getSession(id);
  }

  @Post('sessions/:id/messages')
  async addMessage(
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Body() dto: CreateChatMessageDto,
  ) {
    // Cast strict local enum
    return this.chatService.addMessage(sessionId, ChatRole.USER, dto.content);
  }

  // PATCH /api/chat/messages/:id
  @Patch('messages/:id')
  async updateMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('content') content: string, // Simple extraction
  ) {
    return this.chatService.updateMessage(id, content);
  }

  // DELETE /api/chat/messages/:id
  @Delete('messages/:id')
  async removeMessage(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.deleteMessage(id);
  }

  @Delete('sessions/:id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.chatService.deleteSession(id);
  }
}
