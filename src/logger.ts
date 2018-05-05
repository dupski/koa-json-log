
import * as Koa from 'koa';

export interface ILogData {
    timestamp: string;
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
    logFn: (data: string) => boolean;
    onLog: (data: ILogData) => void;
}

export function getOptions(options?: Partial<ILogOptions>) {
    const opts = options || {};
    if (typeof opts.jsonLog == 'undefined') {
        opts.jsonLog = process.env.NODE_ENV != 'development';
    }
    if (typeof opts.logFn == 'undefined') {
        opts.logFn = process.stdout.write;
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
            opts.logFn(`${data.timestamp} - ${data.statusCode} ${data.method} ${data.url} - ${data.responseTime}ms`);
            if (thrownError) {
                opts.logFn(thrownError);
            }
        }
        else {
            opts.logFn(JSON.stringify(data) + '\n');
        }
    }

    return async function logger(ctx: Koa.Context, next: () => Promise<any>) {

        const startDate = new Date();
        const start = startDate.getMilliseconds();

        const logData: Partial<ILogData> = {
            timestamp: startDate.toISOString(),
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
