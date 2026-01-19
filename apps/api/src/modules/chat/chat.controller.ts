import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseUUIDPipe,
  Patch,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, CreateChatMessageDto } from '@cortex/shared';
import { ChatRole } from '@cortex/shared';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  create(@Body() createChatSessionDto: CreateChatSessionDto) {
    return this.chatService.create(createChatSessionDto);
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

  /**
   * THE ORCHESTRATOR (POST Stream)
   * 1. Accepts a full JSON body (no URL limits).
   * 2. Writes to the HTTP Response stream directly.
   */
  @Post('sessions/:id/stream')
  async streamMessage(
    @Param('id', ParseUUIDPipe) sessionId: string,
    @Body() body: { prompt: string }, // Simple body for now
    @Res() res: Response,
  ) {
    // 1. Setup Headers for Streaming
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    try {
      // 2. Ignite the Logic Engine
      const stream = this.chatService.chatStream(sessionId, body.prompt);

      // 3. Pipe the Tokens
      for await (const token of stream) {
        res.write(token); // Send chunk immediately
      }

      // 4. Seal the Response
      res.end();
    } catch (error) {
      console.error('Stream Error:', error);
      // If headers aren't sent, we can send JSON error.
      // If streaming started, we just end it (client handles truncation).
      if (!res.headersSent) {
        res.status(500).json({ message: 'The Oracle collapsed.' });
      } else {
        res.end();
      }
    }
  }
}
