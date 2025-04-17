import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ValidationError,
  UniqueConstraintError,
  DatabaseError,
  ConnectionError,
} from 'sequelize';

@Catch()
export class SequelizeExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.errors.map((err) => err.message).join(', ');
    } else if (exception instanceof UniqueConstraintError) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else if (exception instanceof DatabaseError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      message = exception.message;
    } else if (exception instanceof ConnectionError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
