import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ChatMessage } from './chat-message.entity';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string; // Can be auto-summarized later

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // The Relation: One Session -> Many Messages
  // Cascade: true ensures if we delete a session, the messages vanish.
  @OneToMany(() => ChatMessage, (message) => message.session, {
    cascade: true,
  })
  messages: ChatMessage[];
}
