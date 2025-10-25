import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppConfigService } from 'src/app-config';

/**
 * Sets up Swagger documentation for the API Gateway
 *
 * @param app NestJS application instance
 * @param config Application configuration service
 */
export function setupSwagger(
  app: INestApplication,
  config: AppConfigService,
): void {
  // Only set up swagger in development mode
  if (!config.isDevelopment()) {
    return;
  }

  // Create Swagger document configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Gateway')
    .setDescription('API Gateway service for the microservices architecture')
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

  // Create Swagger document
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Set up Swagger UI route
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs/json',
    swaggerOptions: {
      persistAuthorization: true, // Keep authorization when refreshing the page
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  });
}
