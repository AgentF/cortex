import { IsString, IsUUID, IsNumber, IsOptional } from "class-validator";

export class DocumentChunkDto {
  @IsUUID()
  id: string;

  @IsUUID()
  documentId: string;

  @IsString()
  content: string;

  @IsNumber()
  chunkIndex: number;

  @IsOptional()
  metadata?: any;
}
