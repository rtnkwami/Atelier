import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { PrismaExceptionFilter } from './exceptions/prisma-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    const configService = app.get(ConfigService);

    app.useLogger(app.get(Logger));

    app.useGlobalFilters(new PrismaExceptionFilter());

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            stopAtFirstError: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    const port = configService.get<number>('PORT');
    await app.listen(port ?? 5000, '0.0.0.0');
}
void bootstrap();
