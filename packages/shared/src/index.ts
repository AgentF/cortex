// packages/shared/src/index.ts

export interface Document {
  id: string;
  title: string;
  content: string; // Will hold JSON string for Tiptap editor
  createdAt: Date;
  updatedAt: Date;
  // The Embedding Vector (Optional on frontend, required in DB)
  embedding?: number[];
}

// DTO: Data Transfer Object
// This is exactly what the Frontend must send to create a note.
export interface CreateDocumentDto {
  title: string;
  content: string;
}