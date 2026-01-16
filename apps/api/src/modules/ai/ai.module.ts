import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';

@Global() // Make it available everywhere without re-importing
@Module({
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
