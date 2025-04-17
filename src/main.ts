import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SequelizeExceptionFilter } from './filters/SequelizeException.Filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = {
    origin: '*',
    methods: 'GET, PUT, POST, DELETE',
    allowedHeaders: '*',
  };
  app.enableCors(options);
  app.useGlobalFilters(new SequelizeExceptionFilter());
  await app.listen(3000);
}
bootstrap();
