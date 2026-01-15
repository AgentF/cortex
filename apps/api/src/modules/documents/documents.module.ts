import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), AiModule], // Registers Repository<Document>
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [TypeOrmModule], // Export if other modules need access to the repository
})
export class DocumentsModule {}
