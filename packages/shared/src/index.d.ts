export interface Document {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    embedding?: number[];
}
export interface CreateDocumentDto {
    title: string;
    content: string;
}
