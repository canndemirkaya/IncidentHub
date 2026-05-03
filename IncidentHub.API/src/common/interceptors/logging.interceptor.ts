import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private logger = new Logger('HTTP');
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url } = req;
        const now = Date.now();
        const res = context.switchToHttp().getResponse();
        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - now;
                const status = res?.statusCode;
                this.logger.log(`${method} ${url} ${status} - ${ms}ms`);
            }),
        );
    }
}
