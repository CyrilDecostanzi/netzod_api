import { Logger } from '@nestjs/common';
import * as winston from 'winston';

interface Error {
  message: string;
  code: string;
  stack: string;
  name: string;
}

export const loggerOptions: winston.LoggerOptions = {
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error', // Niveau pour les erreurs
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/info.log',
      level: 'info', // Niveau pour les informations
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
  ],
};

export const logError = (
  logger: Logger,
  error: Error,
  message = 'Erreur 500' as string,
) => {
  logger.error(`
File : ${message}
Name : ${error.name}
Code : ${error.code}
Message : ${error.message}
Stack : ${error.stack}
  `);
};

export const logInfo = (logger: Logger, message: string) => {
  logger.log(message);
};
