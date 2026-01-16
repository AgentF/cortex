import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { AiService } from './modules/ai/ai.service';
import { DocumentDto } from '@cortex/shared';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): DocumentDto {
    return this.appService.getHello();
  }

  // constructor(private readonly aiService: AiService) {}

  // @Get('test-ai')
  // async testAi(): Promise<string> {
  //   return await this.aiService.generate('Define the word: Mentat.');
  // }
}
