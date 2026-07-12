import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

export class ContextWithLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ContextWithLogInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const now = Date.now();
    const method = request.method;
    const url = request.originalUrl;
    const user = request.user ? JSON.stringify(request.user) : 'anonymous';

    const baseLog = [`USER: ${user}`, `METHOD: ${method}`, `URL: ${url}`];

    this.logger.debug(
      [`[REQUEST IN]`, ...baseLog, `AT: ${new Date().toISOString()}`].join(
        ' | ',
      ),
    );

    if (request.body) {
      request.body.context = {
        params: request.params,
        query: request.query,
        user: request.user,
      };
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        this.logger.debug(
          [`[RESPONSE OUT]`, ...baseLog, `TOOK: ${duration}ms`].join(' | '),
        );
      }),
      catchError((err: unknown) => {
        const duration = Date.now() - now;
        this.logger.error(
          [
            `[ERROR]`,
            ...baseLog,
            `DURATION: ${duration}ms`,
            `MESSAGE: ${(err as Error).message}`,
          ].join(' | '),
        );
        return throwError(() => err);
      }),
    );
  }
}
