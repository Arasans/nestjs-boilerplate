import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { useContainer, ValidationError } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  GlobalExceptionFilter,
  TrimPipe,
  validateErrorFormat,
  ResponseInterceptor,
} from '@app/common';
import { ContextWithLogInterceptor } from '@app/common/interceptors/context-with-log.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('API')
      .setDescription('Boilerplate API')
      .setVersion('1.0')
      .addBearerAuth()
      .build(),
  );
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalPipes(new TrimPipe());
  app.useGlobalInterceptors(
    new ContextWithLogInterceptor(),
    new ResponseInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      whitelist: true,
      validateCustomDecorators: true,
      forbidUnknownValues: false,
      stopAtFirstError: true,
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = validateErrorFormat(errors);
        return new BadRequestException({
          status_code: HttpStatus.BAD_REQUEST,
          message: 'Bad Request',
          data: messages,
        });
      },
    }),
  );

  app.enableShutdownHooks();

  app.use((req: any, res: any, next: any) => {
    res.removeHeader('X-Powered-By');
    next();
  });
  app.useGlobalFilters(new GlobalExceptionFilter());

  setupSwagger(app);
  await app.listen(configService.get<string>('APP_PORT') || '3000');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
