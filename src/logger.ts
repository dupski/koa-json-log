
import * as Koa from 'koa';

export interface ILogData {
    method: string;
    url: string;
    query: string;
    remoteAddress: string;
    host: string;
    userAgent: string;
    statusCode: number;
    errorMessage: string;
    errorStack: string;
    data: any;
    responseTime: number;
}

export interface ILogOptions {
    jsonLog: boolean;
    requestLogFn: (data: string) => boolean;
    errorLogFn: (data: string) => boolean;
    onLog: (data: ILogData) => void;
}

export function getOptions(options?: Partial<ILogOptions>) {
    const opts = options || {};
    if (typeof opts.jsonLog == 'undefined') {
        opts.jsonLog = process.env.NODE_ENV != 'development';
    }
    if (typeof opts.requestLogFn == 'undefined') {
        opts.requestLogFn = process.stdout.write;
    }
    if (typeof opts.errorLogFn == 'undefined') {
        opts.errorLogFn = process.stderr.write;
    }
    return opts as ILogOptions;
}

export function jsonLog(options?: Partial<ILogOptions>) {

    const opts = getOptions(options);

    function outputLog(data: ILogData, thrownError: any) {
        if (opts.onLog) {
            opts.onLog(data);
        }
        if (!opts.jsonLog) {
            if (thrownError) {
                opts.errorLogFn(`${data.statusCode} ${data.method} ${data.url} - ${data.responseTime}ms`);
                opts.errorLogFn(thrownError);
            }
            else {
                opts.requestLogFn(`${data.statusCode} ${data.method} ${data.url} - ${data.responseTime}ms`);
            }
        }
        else if (data.statusCode < 400) {
            opts.requestLogFn(JSON.stringify(data) + '\n');
        }
        else {
            opts.errorLogFn(JSON.stringify(data) + '\n');
        }
    }

    return async function logger(ctx: Koa.Context, next: () => Promise<any>) {

        const start = new Date().getMilliseconds();

        const logData: Partial<ILogData> = {
            method: ctx.method,
            url: ctx.url,
            query: ctx.query,
            remoteAddress: ctx.request.ip,
            host: ctx.headers['host'],
            userAgent: ctx.headers['user-agent'],
        };

        let errorThrown: any = null;
        try {
            await next();
            logData.statusCode = ctx.status;
        }
        catch (e) {
            errorThrown = e;
            logData.errorMessage = e.message;
            logData.errorStack = e.stack;
            logData.statusCode = e.status || 500;
            if (e.data) {
                logData.data = e.data;
            }
        }

        logData.responseTime = new Date().getMilliseconds() - start;
        outputLog(logData as ILogData, errorThrown);

        if (errorThrown) {
            ctx.status = 500;
        }

    };

}
