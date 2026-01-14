import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('documents') // Maps to SQL table 'documents'
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' }) // 'text' type has no length limit in Postgres (ideal for Markdown)
  content: string;

  @CreateDateColumn({ type: 'timestamptz' }) // 'timestamptz' handles timezone offsets correctly
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
