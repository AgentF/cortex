import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ghost')
  async classifyIntent(@Body('input') input: string) {
    return this.aiService.classifyIntent(input);
  }
}
