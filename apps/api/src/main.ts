import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useLogger(app.get(Logger));

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
void bootstrap();
