import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChatModule } from './modules/chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service'; // Keep AppService if AppController uses it for other things
import { AiModule } from './modules/ai/ai.module'; // Ensure AiModule is imported

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
    ChatModule,
    DocumentsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
