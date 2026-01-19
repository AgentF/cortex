import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { DocumentChunk } from './entities/document-chunk.entity';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  SearchResultDto,
} from '@cortex/shared';
import { AiService } from '../ai/ai.service';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(DocumentChunk)
    private chunkRepository: Repository<DocumentChunk>,
    private aiService: AiService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    // 1. Save the Raw Document (No Vectors yet)
    const doc = this.documentRepository.create(createDocumentDto);
    const savedDoc = await this.documentRepository.save(doc);

    // 2. Trigger Ingestion (Chunking + Embedding)
    if (savedDoc.content) {
      await this.ingestDocument(savedDoc);
    }

    return savedDoc;
  }

  async findAll(): Promise<Document[]> {
    return this.documentRepository.find({ order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Document> {
    return this.documentRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    // 1. Update the Text
    await this.documentRepository.update(id, updateDocumentDto);
    const updatedDoc = await this.documentRepository.findOneBy({ id });

    // 2. Re-Ingest if content changed
    if (updateDocumentDto.content) {
      await this.ingestDocument(updatedDoc);
    }

    return updatedDoc;
  }

  async remove(id: string): Promise<void> {
    await this.documentRepository.delete(id);
  }

  // --- THE INGESTION ENGINE (Chunking Logic) ---
  private async ingestDocument(doc: Document): Promise<void> {
    this.logger.log(`Ingesting Document: ${doc.id}`);

    // A. Clear existing chunks (Idempotency)
    await this.chunkRepository.delete({ documentId: doc.id });

    // B. Split Content into Logical Chunks (Paragraphs)
    // We split by double newline. If a paragraph is too short, we could merge,
    // but for now, raw paragraph splitting is efficient.
    const paragraphs = doc.content
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0);

    const chunksToSave: DocumentChunk[] = [];

    // C. Embed each Chunk
    for (const [index, text] of paragraphs.entries()) {
      // Basic context optimization: Prepend title to first chunk for context
      const textToEmbed = index === 0 ? `${doc.title}\n${text}` : text;

      const embedding = await this.aiService.embed(textToEmbed);

      const chunk = this.chunkRepository.create({
        content: text,
        chunkIndex: index,
        documentId: doc.id, // Foreign Key Link
        embedding: embedding,
      });

      chunksToSave.push(chunk);
    }

    // D. Batch Save
    if (chunksToSave.length > 0) {
      await this.chunkRepository.save(chunksToSave);
      this.logger.log(
        `Generated ${chunksToSave.length} chunks for Doc: ${doc.title}`,
      );
    }
  }

  // --- THE SEMANTIC SEARCH v2 (Chunk-Based) ---
  async search(query: string, limit = 5): Promise<SearchResultDto[]> {
    const queryVector = await this.aiService.embed(query);
    if (queryVector.length === 0) return [];

    // Search against CHUNKS, not Documents
    const results = await this.chunkRepository
      .createQueryBuilder('chunk')
      .leftJoinAndSelect('chunk.document', 'document') // Join Parent
      .select(['chunk.id', 'chunk.content', 'document.id', 'document.title'])
      .addSelect('1 - (chunk.embedding <=> :queryVec::vector)', 'similarity')
      .where('1 - (chunk.embedding <=> :queryVec::vector) > :threshold', {
        threshold: 0.5,
      })
      .orderBy('similarity', 'DESC')
      .limit(limit)
      .setParameter('queryVec', `[${queryVector.join(',')}]`)
      .getRawMany();

    // Map to DTO
    return results.map((r) => ({
      documentId: r.document_id,
      title: r.document_title,
      // The Chunk IS the content now. It is the precise answer.
      content: r.chunk_content,
      // Mapping raw similarity to the DTO property
      similarity: parseFloat(r.similarity),
    }));
  }
}
