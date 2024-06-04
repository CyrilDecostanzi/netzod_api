import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { formatErrors } from './lib/exceptions/format-exception';
import { WinstonModule } from 'nest-winston';
import { loggerOptions } from './lib/logger/logger';
import moment from 'moment';
import 'moment-timezone';
import express from 'express';
import * as path from 'path';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const server = express();
  server.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  moment.tz.setDefault('Europe/Paris');

  const logger = WinstonModule.createLogger(loggerOptions);
  app.useLogger(logger);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors({
    origin: [process.env.FRONT_URL],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => {
        return formatErrors(errors);
      },
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(3001, '0.0.0.0');
}
bootstrap();
