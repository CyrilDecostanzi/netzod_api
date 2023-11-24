import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { formatErrors } from './lib/exceptions/format-exception';
import { WinstonModule } from 'nest-winston';
import { loggerOptions } from './lib/logger/logger';
import moment from 'moment';
import 'moment-timezone';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
    }),
  );
  await app.listen(3001, '0.0.0.0');
}
bootstrap();
