import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
} from "class-validator";

export enum ChatRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

// --- PERSISTENCE DTOs (Database) ---

export class CreateChatSessionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  firstMessage?: string;
}

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(ChatRole)
  role: ChatRole;

  @IsUUID()
  sessionId: string;
}

export class ChatMessageDto {
  @IsUUID()
  id: string;

  @IsString()
  content: string;

  @IsEnum(ChatRole)
  role: ChatRole;

  createdAt: Date;
}

export class ChatSessionDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  createdAt: Date;
  updatedAt: Date;
}

// --- SIGNAL DTOs (Runtime/API) ---

/**
 * The payload for the Stream/Generation endpoint.
 * This carries the context which is ephemeral (temporary).
 */
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string; // The user's prompt

  @IsOptional()
  @IsString()
  activeContext?: string; // The injected memory (Editor content)
}
