import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    auth({
      audience: process.env.AUDIENCE,
      issuerBaseURL: process.env.ISSUER_BASE_URL,
    })(req, res, next);
  }
}
