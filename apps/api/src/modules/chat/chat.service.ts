import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRole, CreateChatSessionDto } from '@cortex/shared';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';
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

  async create(
    createChatSessionDto: CreateChatSessionDto,
  ): Promise<ChatSession> {
    // 1. Create Session
    // USE 'sessionRepo' (Local Variable)
    const session = this.sessionRepo.create({
      title:
        createChatSessionDto.title || `Session ${new Date().toISOString()}`,
    });
    const savedSession = await this.sessionRepo.save(session);

    // 2. Atomic Message Creation
    if (createChatSessionDto.firstMessage) {
      // USE 'messageRepo' (Local Variable)
      const message = this.messageRepo.create({
        content: createChatSessionDto.firstMessage,
        role: ChatRole.USER,
        session: savedSession,
      });
      await this.messageRepo.save(message);
    }

    return savedSession;
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
   * 2. Search Context (RAG)
   * 3. Build Prompt (System + Visual + RAG)
   * 4. Stream Response
   * 5. Save AI Message
   */
  async *chatStream(
    sessionId: string,
    userQuery: string,
    activeContext?: string, // <--- The Editor Content
  ) {
    // 1. Persistence (User)
    await this.addMessage(sessionId, ChatRole.USER, userQuery);

    // 2. Retrieval (RAG - Long Term Memory)
    const searchResults = await this.documentsService.search(userQuery, 3);

    // DEFINITION: We define 'ragContext' here so it exists for the prompt later
    const ragContext = searchResults
      .map((doc) => `[Reference: ${doc.title}]\n${doc.content}`)
      .join('\n---\n');

    // 3. History Retrieval
    const session = await this.getSession(sessionId);
    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 4. Prompt Engineering
    let systemInstructions = `You are CORTEX, a Second Brain software architect.
    Your goal is to answer the user's request efficiently.
    
    RULES:
    1. If the answer is found in the "VISUAL CONTEXT" (The user's open file), prioritize that information.
    2. If not, check "KNOWLEDGE BASE" (RAG).
    3. Be concise. Show code if requested.
    `;

    // INJECTION: Visual Context (Short Term Memory)
    if (activeContext && activeContext.trim().length > 0) {
      systemInstructions += `\n\n=== VISUAL CONTEXT (USER IS LOOKING AT THIS NOW) ===\n${activeContext}\n==================================================\n`;
    }

    // INJECTION: RAG Context (Long Term Memory)
    if (ragContext.length > 0) {
      systemInstructions += `\n\n=== KNOWLEDGE BASE (RELEVANT NOTES) ===\n${ragContext}\n=======================================\n`;
    }

    const systemPrompt = {
      role: 'system',
      content: systemInstructions,
    };

    // Construct the final message array
    const fullPrompt = [systemPrompt, ...history];

    // 5. Streaming
    let fullAiResponse = '';
    const stream = this.aiService.streamChat(fullPrompt);

    for await (const token of stream) {
      fullAiResponse += token;
      yield token;
    }

    // 6. Persistence (AI)
    await this.addMessage(sessionId, ChatRole.ASSISTANT, fullAiResponse);
  }
}
