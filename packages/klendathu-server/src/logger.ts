import * as winston from 'winston';

export const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      colorize: true,
      timestamp: true,
      level: process.env.LOG_LEVEL || 'info',
    }),
  ],
});
