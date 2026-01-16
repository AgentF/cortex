import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Ollama } from 'ollama';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollama: Ollama;
  private readonly EMBEDDING_MODEL = 'nomic-embed-text';
  private readonly CHAT_MODEL = 'gemma3:4b';

  constructor() {
    // 127.0.0.1 is safer than 'localhost' for Node/Docker networking quirks
    this.ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
  }

  /**
   * Pings the runtime to ensure connectivity.
   */
  async checkHealth(): Promise<boolean> {
    try {
      await this.ollama.list();
      return true;
    } catch (error) {
      this.logger.error('Ollama is unreachable', error);
      return false;
    }
  }

  /**
   * Vector Generation
   * Used by DocumentsService to index content.
   * Converts text into a 768-dimensional vector using nomic-embed-text
   */
  async embed(content: string): Promise<number[]> {
    // 1. Efficiency Guard: Don't process empty air.
    if (!content || content.trim().length === 0) {
      return [];
    }

    try {
      const response = await this.ollama.embeddings({
        model: this.EMBEDDING_MODEL,
        prompt: content,
      });
      return response.embedding;
    } catch (error) {
      this.logger.error(
        `Embedding Failed (Model: ${this.EMBEDDING_MODEL})`,
        error,
      );
      throw new InternalServerErrorException('Vector calculation failed');
    }
  }

  /**
   * Stream Generator
   * Used by ChatService/Orchestrator to talk to the User.
   */
  async *streamChat(history: { role: string; content: string }[]) {
    try {
      const response = await this.ollama.chat({
        model: this.CHAT_MODEL,
        messages: history,
        stream: true,
      });

      for await (const part of response) {
        yield part.message.content;
      }
    } catch (error) {
      this.logger.error(`Stream Failed (Model: ${this.CHAT_MODEL})`, error);
      throw new InternalServerErrorException('The Oracle is silent.');
    }
  }

  /**
   * Phase 4: One-Shot Generator
   * Utility for testing or simple tasks.
   */
  async generate(prompt: string): Promise<string> {
    try {
      const response = await this.ollama.chat({
        model: this.CHAT_MODEL,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.message.content;
    } catch (error) {
      this.logger.error(`Generation Failed (Model: ${this.CHAT_MODEL})`, error);
      throw new InternalServerErrorException('Inference failed');
    }
  }
}
