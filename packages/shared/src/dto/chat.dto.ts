import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";

// 1. The Role Discriminator
// Strict typing prevents "system" or "tool" hallucinations later.
export enum ChatRole {
  USER = "user",
  ASSISTANT = "assistant",
}

// 2. The Message Structure
export class ChatMessageDto {
  @IsUUID()
  id: string;

  @IsEnum(ChatRole)
  role: ChatRole;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  createdAt: string; // ISO String for serialization safety
}

// 3. The Session Container
export class ChatSessionDto {
  @IsUUID()
  id: string;

  @IsString()
  title: string;

  @IsString()
  createdAt: string;

  // We optionally include messages for full history load
  messages?: ChatMessageDto[];
}

// 4. Input DTOs (What the client sends)
export class CreateChatSessionDto {
  @IsString()
  @IsNotEmpty()
  firstMessage: string; // We start a session with a prompt
}

export class CreateChatMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  sessionId: string;
}
