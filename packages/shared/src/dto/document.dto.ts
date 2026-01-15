// 1. The input for creation
export class CreateDocumentDto {
  title: string;
  content: string;
}

// 2. The input for updates (Partial means everything is optional)
export class UpdateDocumentDto {
  title?: string;
  content?: string;
}

// 3. The output (what the API sends back)
export class DocumentDto {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
