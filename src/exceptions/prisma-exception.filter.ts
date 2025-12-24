import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from 'src/generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    public catch(
        error: Prisma.PrismaClientKnownRequestError,
        host: ArgumentsHost,
    ) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        switch (error.code) {
            case 'P2025':
                response.status(HttpStatus.NOT_FOUND).json({
                    statusCode: 404,
                    message: 'Resource not found',
                });
                return;

            case 'P1001':
            case 'ECONNREFUSED':
                response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
                    statusCode: 503,
                    message: 'Service temporarily unavailable',
                });
                return;

            default:
                response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                    statusCode: 500,
                    message: 'Internal server error',
                    error: error.code,
                });
                return;
        }
    }
}
