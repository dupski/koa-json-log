
import * as Koa from 'koa';
import { Server } from 'http';
import { agent, SuperTest, Test } from 'supertest';

import { jsonLog } from '../index';
import { ILogData } from '../logger';

describe('logger', () => {
    let server: Server;
    let request: SuperTest<Test>;
    let logData: ILogData[];
    let logOutput: string[];

    function setup(options: {
        statusCode?: number,
        ctxThrow?: string,
        throw?: string,
    }) {
        const app = new Koa();
        logData = [];
        logOutput = [];
        app.use(jsonLog({
            onLog: (data) => {
                logData.push(data);
            },
            logFn: (data) => {
                logOutput.push(data); return true;
            },
        }));
        app.use((ctx) => {
            if (options.ctxThrow) {
                ctx.throw(options.statusCode || 500, options.ctxThrow);
            }
            else if (options.throw) {
                throw new Error(options.throw);
            }
            else {
                ctx.status = options.statusCode || 200;
                ctx.body = 'test_response';
            }
        });
        server = app.listen();
        request = agent(server);
    }

    afterEach(() => {
        server.close();
    });

    describe('development mode', () => {

        beforeAll(() => {
            process.env.NODE_ENV = 'development';
        });

        [
            200,
            201,
            202,
            302,
        ]
        .map((statusCode) => {
            it('logs successful request: ' + statusCode, async () => {
                setup({ statusCode });

                const response = await request.get('/');
                expect(response.status).toEqual(statusCode);
                expect(response.text).toEqual('test_response');
                expect(logOutput).toHaveLength(1);

                const data = logData[0];
                const expectedLog = `${data.timestamp} - ${statusCode} GET / - ${data.responseTime}ms`;

                expect(logOutput[0]).toEqual(expectedLog);
            });
        });

        [
            400,
            401,
            404,
        ]
        .map((statusCode) => {
            it('logs problem request: ' + statusCode, async () => {
                setup({ statusCode });

                const response = await request.get('/');
                expect(response.status).toEqual(statusCode);
                expect(response.text).toEqual('test_response');
                expect(logOutput).toHaveLength(1);

                const data = logData[0];
                const expectedLog = `${data.timestamp} - ${statusCode} GET / - ${data.responseTime}ms`;

                expect(logOutput[0]).toEqual(expectedLog);
            });
        });

        [
            { ctxThrow: 'Unauthorised', statusCode: 401 },
            { ctxThrow: 'Cant find it bruv!', statusCode: 404 },
        ]
        .map((options) => {
            it('handles ctx.throw(): ' + options.statusCode, async () => {
                setup(options);

                const response = await request.get('/');
                expect(response.status).toEqual(options.statusCode);
                expect(response.text).toEqual(options.ctxThrow);

                expect(logOutput).toHaveLength(2);

                const data = logData[0];
                const expectedLog1 = `${data.timestamp} - ${options.statusCode} GET / - ${data.responseTime}ms`;
                const expectedLog2 = data.errorStack;

                expect(logOutput[0]).toEqual(expectedLog1);
                expect(logOutput[1]).toEqual(expectedLog2);
            });
        });

        it('handles other thrown errors', async () => {
            setup({ throw: 'Ack nooo!!!' });

            const response = await request.get('/');
            expect(response.status).toEqual(500);
            expect(response.text).toEqual('Internal Server Error');

            expect(logOutput).toHaveLength(2);

            const data = logData[0];
            const expectedLog1 = `${data.timestamp} - 500 GET / - ${data.responseTime}ms`;
            const expectedLog2 = data.errorStack;

            expect(logOutput[0]).toEqual(expectedLog1);
            expect(logOutput[1]).toEqual(expectedLog2);
        });

    });

    describe('production (json) mode', () => {

        beforeAll(() => {
            process.env.NODE_ENV = 'not_development___';
        });

        [
            200,
            201,
            202,
            302,
        ]
        .map((statusCode) => {
            it('logs successful request: ' + statusCode, async () => {
                setup({ statusCode });

                const response = await request.get('/');
                expect(response.status).toEqual(statusCode);
                expect(response.text).toEqual('test_response');
                expect(logOutput).toHaveLength(1);

                const data = logData[0];
                expect(JSON.parse(logOutput[0])).toEqual(
                    {
                        timestamp: data.timestamp,
                        method: 'GET',
                        url: '/',
                        query: {},
                        host: data.host,
                        userAgent: data.userAgent,
                        remoteAddress: data.remoteAddress,
                        responseTime: data.responseTime,
                        statusCode,
                    },
                );
            });
        });

        [
            400,
            401,
            404,
        ]
        .map((statusCode) => {
            it('logs problem request: ' + statusCode, async () => {
                setup({ statusCode });

                const response = await request.get('/');
                expect(response.status).toEqual(statusCode);
                expect(response.text).toEqual('test_response');
                expect(logOutput).toHaveLength(1);

                const data = logData[0];
                expect(JSON.parse(logOutput[0])).toEqual(
                    {
                        timestamp: data.timestamp,
                        method: 'GET',
                        url: '/',
                        query: {},
                        host: data.host,
                        userAgent: data.userAgent,
                        remoteAddress: data.remoteAddress,
                        responseTime: data.responseTime,
                        statusCode,
                    },
                );
            });
        });

        [
            { ctxThrow: 'Unauthorised', statusCode: 401 },
            { ctxThrow: 'Cant find it bruv!', statusCode: 404 },
        ]
        .map((options) => {
            it('handles ctx.throw(): ' + options.statusCode, async () => {
                setup(options);

                const response = await request.get('/');
                expect(response.status).toEqual(options.statusCode);
                expect(response.text).toEqual(options.ctxThrow);

                expect(logOutput).toHaveLength(1);

                const data = logData[0];
                expect(JSON.parse(logOutput[0])).toEqual(
                    {
                        timestamp: data.timestamp,
                        method: 'GET',
                        url: '/',
                        query: {},
                        host: data.host,
                        userAgent: data.userAgent,
                        remoteAddress: data.remoteAddress,
                        responseTime: data.responseTime,
                        statusCode: options.statusCode,
                        errorMessage: data.errorMessage,
                        errorStack: data.errorStack,
                    },
                );
            });
        });

        it('handles other thrown errors', async () => {
            setup({ throw: 'Ack nooo!!!' });

            const response = await request.get('/');
            expect(response.status).toEqual(500);
            expect(response.text).toEqual('Internal Server Error');

            expect(logOutput).toHaveLength(1);

            const data = logData[0];
            expect(JSON.parse(logOutput[0])).toEqual(
                {
                    timestamp: data.timestamp,
                    method: 'GET',
                    url: '/',
                    query: {},
                    host: data.host,
                    userAgent: data.userAgent,
                    remoteAddress: data.remoteAddress,
                    responseTime: data.responseTime,
                    statusCode: 500,
                    errorMessage: data.errorMessage,
                    errorStack: data.errorStack,
                },
            );
        });

    });

});
