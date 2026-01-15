import { api } from "../lib/axios";
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentDto,
} from "@cortex/shared";

export const documentsApi = {
  // GET /documents
  getAll: async () => {
    const response = await api.get<DocumentDto[]>("/documents");
    return response.data;
  },

  // GET /documents/:id
  getOne: async (id: string) => {
    const response = await api.get<DocumentDto>(`/documents/${id}`);
    return response.data;
  },

  // POST /documents
  create: async (data: CreateDocumentDto) => {
    const response = await api.post<DocumentDto>("/documents", data);
    return response.data;
  },

  // PATCH /documents/:id
  update: async (id: string, data: UpdateDocumentDto) => {
    const response = await api.patch<DocumentDto>(`/documents/${id}`, data);
    return response.data;
  },

  // DELETE /documents/:id
  delete: async (id: string) => {
    await api.delete(`/documents/${id}`);
  },
};
