import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away properties that do not have decorators (Security)
      forbidNonWhitelisted: true, // Throws an error if extra properties are sent (Strictness)
      transform: true, // Automatically transforms payloads to be instances of their DTO classes
    }),
  );

  // Allows the frontend to communicate with the backend
  app.enableCors({
    origin: 'http://localhost:5173', // Restrict to my frontend only
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
