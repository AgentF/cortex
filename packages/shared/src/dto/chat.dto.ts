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
