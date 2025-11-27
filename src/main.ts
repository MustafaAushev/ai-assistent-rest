import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configDotenv } from 'dotenv';
import { writeFileSync } from 'node:fs';

configDotenv();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder().setTitle('ai assistent rest').build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, documentFactory);

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('./swagger-spec.json', JSON.stringify(document));

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Listening on port ${process.env.PORT ?? 3000}`);
  });
}

bootstrap();
