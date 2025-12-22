import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    use(req: Request, res: Response, next: NextFunction) {
        auth({
            audience: this.configService.get<string>('AUDIENCE'),
            issuerBaseURL: this.configService.get<string>('ISSUER_BASE_URL'),
        })(req, res, next);
    }
}
