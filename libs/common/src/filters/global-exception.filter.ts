import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let errorResponse: any;
    let statusCode: HttpStatus;

    if (exception instanceof ServiceUnavailableException) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      const exceptionResponse = exception.getResponse() as any;
      errorResponse = {
        status_code: statusCode,
        message: exception.message || 'Service is under maintenance',
        data: exceptionResponse.data || null,
      };
    } else if (exception instanceof BadRequestException) {
      statusCode = HttpStatus.BAD_REQUEST;
      const responseBody = exception.getResponse() as any;
      errorResponse = {
        status_code: statusCode,
        message: 'Bad Request',
        data: responseBody.data ?? responseBody.message,
      };
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const messageMap: Record<number, string> = {
        [HttpStatus.NOT_FOUND]: 'Not Found',
        [HttpStatus.FORBIDDEN]: 'Forbidden',
        [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
        [HttpStatus.BAD_REQUEST]: 'Bad Request',
      };
      errorResponse = {
        status_code: statusCode,
        message: messageMap[statusCode] || exception.message || 'Bad Request',
        data: (exception.getResponse() as any)?.message || exception.message,
      };
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = {
        status_code: statusCode,
        message: 'Internal Server Error',
        data: exception.message || null,
      };
    }

    this.logger.error(
      [
        `${request.method} ${request.url}`,
        `User: ${JSON.stringify(request.user)}`,
        `Error: ${exception?.message}`,
        `Stack: ${exception?.stack}`,
      ].join(' | '),
    );

    response.status(statusCode).json(errorResponse);
  }
}
