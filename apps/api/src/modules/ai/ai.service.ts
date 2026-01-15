import { Injectable, Logger } from '@nestjs/common';
import { Ollama } from 'ollama';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollama: Ollama;

  constructor() {
    // 127.0.0.1 is safer than 'localhost' for Node/Docker networking quirks
    this.ollama = new Ollama({ host: 'http://127.0.0.1:11434' });
  }

  /**
   * Converts text into a 768-dimensional vector using nomic-embed-text
   */
  async embed(content: string): Promise<number[]> {
    // 1. Efficiency Guard: Don't process empty air.
    if (!content || content.trim().length === 0) {
      return [];
    }

    try {
      // 2. The Compute Step (This is the slow part ~100ms)
      const response = await this.ollama.embeddings({
        model: 'nomic-embed-text',
        prompt: content,
      });

      return response.embedding;
    } catch (error) {
      // 3. Risk Mitigation: If AI is down, don't crash the App.
      // Log it and return empty so the user can still save their text.
      this.logger.error(`Ollama Connection Failed: ${error.message}`);
      return [];
    }
  }
}
