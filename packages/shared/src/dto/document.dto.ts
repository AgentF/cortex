import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
} from "class-validator";

export class DocumentDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  createdAt: Date;
  updatedAt: Date;
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;
}

export class SearchResultDto {
  @IsUUID()
  documentId: string;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsNumber()
  similarity: number;
}
