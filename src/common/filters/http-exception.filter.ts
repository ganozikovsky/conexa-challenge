import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';

import { Request, Response } from 'express';

import { IS_PRODUCTION } from '../constants';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let error: string;
    let errors: any[] = [];

    if (typeof exceptionResponse === 'object') {
      message = (exceptionResponse as any).message || exception.message;
      error = (exceptionResponse as any).error || exception.name;

      if (Array.isArray((exceptionResponse as any).message)) {
        errors = (exceptionResponse as any).message;
        message = 'Validation failed';
      }
    } else {
      message = exceptionResponse as string;
      error = exception.name;
    }

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url} - ${status}`, exception.stack);
    } else if (status >= 400) {
      this.logger.warn(`${request.method} ${request.url} - ${status} - ${message}`);
    }

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
      ...(errors.length > 0 ? { errors } : {}),
      ...(exception.stack && !IS_PRODUCTION ? { stack: exception.stack } : {}),
    };

    response.status(status).json(responseBody);
  }
}
