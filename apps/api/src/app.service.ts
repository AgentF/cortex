import { Injectable } from '@nestjs/common';
// IMPORTING FROM OUR SHARED LIBRARY
import { DocumentDto } from '@cortex/shared';

@Injectable()
export class AppService {
  getHello(): DocumentDto {
    // We return a strongly-typed Document, not just a string
    return {
      id: '123',
      title: 'Cortex System Online',
      content: 'The Monorepo link is active.',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
