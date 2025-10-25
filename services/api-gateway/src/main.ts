import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppConfigService } from './app-config';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Set up Swagger documentation
  const configService = app.get(AppConfigService);
  setupSwagger(app, configService);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`API gateway service is running on port ${port}`);
  logger.log(
    `Swagger documentation is available at http://localhost:${port}/api/docs`,
  );
}
bootstrap();
