import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Ollama } from 'ollama';
import { GhostIntent } from '@cortex/shared';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollama: Ollama;
  private readonly EMBEDDING_MODEL = 'nomic-embed-text-v2-moe';
  private readonly CHAT_MODEL = 'gemma3:4b';
  private readonly GHOST_MODEL = 'functiongemma:latest';

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
   * Converts text into a 768-dimensional vector using nomic-embed-text-v2-moe
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

  /**
   * Classifies natural language into a system command using a specialized micro-model.
   */
  async classifyIntent(input: string): Promise<GhostIntent> {
    this.logger.log(`Processing Ghost Command: "${input}"`);

    // Low-Cognitive Load Prompt
    // We will deduce the intent in code.
    const SYSTEM_PROMPT = `
      Extract a concise document title from the user input.
      Return JSON: { "title": "The Title" }
    `;

    try {
      const response = await this.ollama.chat({
        model: this.GHOST_MODEL,
        messages: [
          { role: 'user', content: `${SYSTEM_PROMPT}\n\nInput: "${input}"` },
        ],
        format: 'json',
        stream: false,
      });

      let raw: any = {};
      try {
        raw = JSON.parse(response.message.content);
      } catch (e) {
        this.logger.warn(
          `JSON Parse Failure. Raw: ${response.message.content}`,
        );
      }

      // --- MENTAT HEURISTIC ENGINE ---

      // 1. Determine Intent
      // Currently, we default to 'create_document' because that is the only active command.
      // In the future, we can regex check for "Search" vs "Create".
      const intent: GhostIntent['intent'] = 'create_document';

      // 2. Extract Title (The "Diamond in the Rough" search)
      let title = '';

      if (raw.title) title = raw.title;
      else if (raw.name) title = raw.name;
      else if (raw.description)
        title = raw.description; // <--- Captures your previous error
      else if (raw.topic) title = raw.topic;
      else if (raw.subject) title = raw.subject;
      else if (raw.parameters?.title) title = raw.parameters.title;

      // 3. Fallback: If AI failed to extract a title, clean the input manually.
      if (!title) {
        this.logger.warn('AI failed to extract title. Using Regex fallback.');
        title = input
          .replace(
            /^(create|draft|make|new)\s+(note|doc|document|file|about)\s*/i,
            '',
          ) // Remove verbs
          .replace(/^about\s+/i, '')
          .trim();

        // Capitalize first letter
        title = title.charAt(0).toUpperCase() + title.slice(1);
      }

      const normalized: GhostIntent = {
        intent,
        parameters: { title },
      };

      this.logger.log(`Final Ghost Intent: ${JSON.stringify(normalized)}`);
      return normalized;
    } catch (error) {
      this.logger.error('Ghost logic failure', error);
      // Ultimate Fail-Safe
      return {
        intent: 'create_document',
        parameters: { title: input },
      };
    }
  }
}
