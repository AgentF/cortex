import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from '@cortex/shared';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentsRepository: Repository<Document>,
  ) {}

  async create(createDocumentDto: CreateDocumentDto): Promise<Document> {
    // 1. Create the entity instance
    const doc = this.documentsRepository.create(createDocumentDto);
    // 2. Save to DB (triggers INSERT)
    return await this.documentsRepository.save(doc);
  }

  async findAll(): Promise<Document[]> {
    // Returns all docs, sorted by newest update first
    return await this.documentsRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document> {
    const doc = await this.documentsRepository.findOneBy({ id });
    if (!doc) {
      throw new NotFoundException(`Document #${id} not found`);
    }
    return doc;
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
  ): Promise<Document> {
    // Check existence first
    await this.findOne(id);

    // Perform update (triggers UPDATE)
    await this.documentsRepository.update(id, updateDocumentDto);

    // Return the fresh entity
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.documentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Document #${id} not found`);
    }
  }
}
