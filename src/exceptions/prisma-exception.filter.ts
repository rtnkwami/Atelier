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

            default:
                throw error;
        }
    }
}
