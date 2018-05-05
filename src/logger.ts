
import * as Koa from 'koa';

interface ILogData {
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

export interface ILogConfig {
    jsonLog?: boolean;
    requestLogFn?: (data: string) => boolean;
    errorLogFn?: (data: string) => boolean;
}

const prettyLog = process.env.NODE_ENV === 'development';

function outputLog(data: Partial<ILogData>, thrownError: any) {
    if (prettyLog) {
        console.log(`${data.statusCode} ${data.method} ${data.url} - ${data.responseTime}ms`);
        if (thrownError) {
            console.error(thrownError);
        }
    }
    else if (data.statusCode && data.statusCode < 400) {
        process.stdout.write(JSON.stringify(data) + '\n');
    }
    else {
        process.stderr.write(JSON.stringify(data) + '\n');
    }
}

export function getOptions(options?: ILogConfig): ILogConfig {
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
    return opts;
}

export function jsonLog(options?: ILogConfig) {

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
        outputLog(logData, errorThrown);

        if (errorThrown) {
            ctx.status = 500;
        }

    };

}
