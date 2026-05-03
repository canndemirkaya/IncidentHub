import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? exception.message : 'Internal server error';

        const body: any = {
            success: false,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        if (exception instanceof HttpException) {
            try {
                const res = exception.getResponse();
                if (typeof res === 'object' && (res as any).message) {
                    body.errors = (res as any).message;
                }
            } catch (e) { }
        }

        // Log full exception on server side for troubleshooting (avoid leaking to clients)
        if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error(exception);
        }

        response.status(status).json(body);
    }
}

