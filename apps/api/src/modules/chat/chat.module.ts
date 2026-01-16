import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiModule } from '../ai/ai.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    AiModule,
    DocumentsModule,
  ],
  controllers: [ChatController], // Register Controller
  providers: [ChatService], // Register Service
  exports: [ChatService], // Export Service for use in Orchestrator later
})
export class ChatModule {}
