import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Configure Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Service API')
    .setDescription('The Inventory service API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token. Example: <token_value>',
        in: 'header',
      },
      'access-token', // This identifier will be used in @ApiBearerAuth('access-token')
    )
    .addSecurityRequirements('access-token') // Apply bearer auth to all endpoints by default
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs/json',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT;
  await app.listen(port);
  console.log(`Inventory service is running on port ${port}`);
  console.log(
    `Swagger documentation available at http://localhost:${port}/api/docs`,
  );
}
bootstrap();
