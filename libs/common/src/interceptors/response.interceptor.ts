import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const statusCode = context.switchToHttp().getResponse().statusCode;

        if (data?.meta) {
          return {
            status_code: statusCode,
            message: 'Success',
            data: data.data,
            meta: data.meta,
          };
        }

        return {
          status_code: statusCode,
          message: 'Success',
          data,
        };
      }),
    );
  }
}
