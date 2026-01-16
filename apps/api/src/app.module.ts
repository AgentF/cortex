import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    // 1. Establish Root Connection to Docker
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // pointing to Docker Port
      port: 5432,
      username: 'admin',
      password: 'secure_password_dev',
      database: 'cortex_local',
      autoLoadEntities: true, // Automatically loads entities from imported modules (Crucial)
      synchronize: true, // DEV ONLY: Auto-creates tables. Disable in Production.
      logging: true,
    }),
    // 2. Load Feature Modules
    DocumentsModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
