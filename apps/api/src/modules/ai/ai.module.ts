import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService], // CRITICAL: Makes this available to DocumentsModule
})
export class AiModule {}
