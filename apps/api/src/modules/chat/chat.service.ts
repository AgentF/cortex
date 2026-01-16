import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage, ChatRole } from './entities/chat-message.entity';
import { AiService } from '../ai/ai.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private sessionRepo: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private messageRepo: Repository<ChatMessage>,
    private aiService: AiService,
    private documentsService: DocumentsService,
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

    const message = this.messageRepo.create({ role, content, session });
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

  /**
   * THE ORCHESTRATOR
   * 1. Save User Message
   * 2. Search Context
   * 3. Build Prompt
   * 4. Stream Response
   * 5. Save AI Message (on completion)
   */
  async *chatStream(sessionId: string, userQuery: string) {
    // 1. Persistence (User)
    await this.addMessage(sessionId, ChatRole.USER, userQuery);

    // 2. Retrieval (RAG)
    // We search for top 3 relevant chunks
    const searchResults = await this.documentsService.search(userQuery, 3);
    const contextBlock = searchResults
      .map(
        (doc) => `[Source: ${doc.title}]\n${doc.content || '...'}`, // Assuming search returns content? Phase 3 check needed.
        // If search only returns IDs/Titles, we might need to fetch content.
        // For now, let's assume specific Logic A: Search returns enough info.
      )
      .join('\n---\n');

    // 3. History Retrieval
    const session = await this.getSession(sessionId);
    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 4. Prompt Engineering
    // We construct the "Active Context"
    const systemPrompt = {
      role: 'system',
      content: `You are CORTEX, a Second Brain. 
      Use the following context to answer the user's question. 
      If the answer is not in the context, say so, but try to help based on general knowledge.
      
      CONTEXT:
      ${contextBlock}
      `,
    };

    // We replace the last user message with the "Augmented" version?
    // Or we prepend the system prompt.
    // Strategy: System Prompt + History (minus last) + Augmented Last Message?
    // Simpler Strategy: System Prompt + Full History.
    // The history already contains the User Query we just saved.

    const fullPrompt = [systemPrompt, ...history];

    // 5. Streaming & Accumulation
    let fullAiResponse = '';
    const stream = this.aiService.streamChat(fullPrompt);

    for await (const token of stream) {
      fullAiResponse += token;
      yield token; // Pass to Controller
    }

    // 6. Persistence (AI)
    // Once the stream is done, we save the full thought.
    await this.addMessage(sessionId, ChatRole.ASSISTANT, fullAiResponse);
  }
}
