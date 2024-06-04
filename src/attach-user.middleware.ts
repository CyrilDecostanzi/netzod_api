import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AttachUserMiddleware implements NestMiddleware {
  use(req: any, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (
      authHeader &&
      authHeader.split(' ')[0] === 'Bearer' &&
      authHeader.split(' ')[1] !== 'undefined'
    ) {
      const token = authHeader.split(' ')[1];

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
      } catch (error) {}
    }
    next();
  }
}
