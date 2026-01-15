import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from '@cortex/shared';
import { UpdateDocumentDto } from '@cortex/shared';
import { AiService } from '../ai/ai.service';
import { SearchResultDto } from '@cortex/shared';

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
  async search(query: string, limit = 5): Promise<SearchResultDto[]> {
    // 1. Transmute Text to Vector
    const queryVector = await this.aiService.embed(query);

    // Guard: If AI fails, return empty list (don't crash)
    if (queryVector.length === 0) return [];

    // 2. The Vector Query
    // We use createQueryBuilder to access raw Postgres functions
    const results = await this.documentRepository
      .createQueryBuilder('document')
      // Select only what we need (Payload Optimization)
      .select(['document.id', 'document.title'])
      // Calculate Similarity: 1 - Distance
      // The <=> operator is "Cosine Distance" (0 = Same, 2 = Opposite)
      // We want Similarity (1 = Same, -1 = Opposite)
      .addSelect('1 - (document.embedding <=> :vector)', 'similarity')
      // Filter: Only documents that have embeddings
      .where('document.embedding IS NOT NULL')
      // Sort: Nearest neighbors first
      .orderBy('document.embedding <=> :vector', 'ASC')
      .limit(limit)
      // Parameter: Format array as string '[0.1, 0.2, ...]' for Postgres
      .setParameter('vector', `[${queryVector.join(',')}]`)
      .getRawMany();

    // 3. Map Raw SQL Result to DTO
    // getRawMany returns flat structure like { document_id: '...', similarity: ... }
    return results.map((r) => ({
      id: r.document_id,
      title: r.document_title,
      similarity: parseFloat(r.similarity), // Ensure number type
    }));
  }
}
