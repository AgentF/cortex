import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from '@cortex/shared';
import { UpdateDocumentDto } from '@cortex/shared';
import { AiService } from '../ai/ai.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly aiService: AiService, // 1. INJECTION
  ) {}

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    // 2. EMBED ON CREATION
    // We await the vector before saving. (Synchronous Approach)
    const embedding = await this.aiService.embed(createDocumentDto.content);

    const document = this.documentRepository.create({
      ...createDocumentDto,
      embedding, // Merge vector into entity
    });

    return this.documentRepository.save(document);
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find({
      order: { updatedAt: 'DESC' },
      // Optimization: Don't pull the heavy vector column for the list view
      select: ['id', 'title', 'content', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: string): Promise<Document> {
    return this.documentRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<void> {
    // 3. CONDITIONAL RE-EMBEDDING
    // Only engage the Neural Engine if the content (knowledge) actually changed.
    // If the user just renamed the file, we skip the heavy math.
    const partialUpdate: any = { ...updateDocumentDto };

    if (updateDocumentDto.content) {
      partialUpdate.embedding = await this.aiService.embed(
        updateDocumentDto.content,
      );
    }

    await this.documentRepository.update(id, partialUpdate);
  }

  async remove(id: string): Promise<void> {
    await this.documentRepository.delete(id);
  }
}
