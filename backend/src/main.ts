import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // 1. Cấu hình CORS cho phép Frontend Next.js gọi API
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // 2. Thiết lập tiền tố URL toàn cục (Global Prefix)
  app.setGlobalPrefix('api/v1');

  // 3. Cấu hình ValidationPipe toàn cục tự động lọc và kiểm tra DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Cấu hình Swagger OpenAPI Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MedAffiliate SaaS Platform API')
    .setDescription(
      'Hệ thống quản lý phân phối dịch vụ y tế sức khỏe tích hợp mạng lưới cộng tác viên và cơ chế đối soát hoa hồng tự động',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập access token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health & System', 'Kiểm tra trạng thái kết nối máy chủ & cơ sở dữ liệu')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'MedAffiliate API Swagger UI',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);
  logger.log(`🚀 Backend NestJS đang lắng nghe tại: http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger API Documentation mở tại: http://localhost:${port}/api/docs`);
  logger.log(`🌐 CORS cho phép kết nối từ Frontend: ${frontendUrl}`);
}

void bootstrap();

