import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage, ChatRole } from './entities/chat-message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
  ) {}

  /**
   * Initializes a new conversation thread.
   */
  async createSession(title?: string): Promise<ChatSession> {
    const session = this.sessionRepo.create({
      title: title || `Session ${new Date().toISOString()}`,
    });
    return this.sessionRepo.save(session);
  }

  /**
   * Retrieves the specific thread with full history.
   * CRITICAL: Messages are sorted Chronologically (ASC).
   */
  async getSession(id: string): Promise<ChatSession> {
    const session = await this.sessionRepo.findOne({
      where: { id },
      relations: ['messages'],
      order: {
        messages: {
          createdAt: 'ASC',
        },
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }

    return session;
  }

  /**
   * Appends a message to the timeline.
   * This is the atomic unit of conversation.
   */
  async addMessage(
    sessionId: string,
    role: ChatRole,
    content: string,
  ): Promise<ChatMessage> {
    const session = await this.sessionRepo.findOneBy({ id: sessionId });
    if (!session) throw new NotFoundException('Session not found');

    const message = this.messageRepo.create({
      role,
      content,
      session,
    });

    return this.messageRepo.save(message);
  }

  /**
   * Lists all sessions (for the Sidebar UI).
   * Sorted by most recently updated.
   */
  async listSessions(): Promise<ChatSession[]> {
    return this.sessionRepo.find({
      order: { updatedAt: 'DESC' },
      take: 50, // Safety limit
    });
  }

  /**
   * Surgical removal of a specific message.
   * Used when the AI hallucinates or the User wants to retry a prompt.
   */
  async deleteMessage(id: string): Promise<void> {
    await this.messageRepo.delete(id);
  }

  /**
   * Correction of a specific data point.
   */
  async updateMessage(id: string, content: string): Promise<ChatMessage> {
    const message = await this.messageRepo.findOneBy({ id });
    if (!message) throw new NotFoundException(`Message ${id} not found`);

    message.content = content;
    return this.messageRepo.save(message);
  }

  async deleteSession(id: string): Promise<void> {
    await this.sessionRepo.delete(id);
  }
}
