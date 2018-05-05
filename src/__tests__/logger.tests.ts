
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
        statusCode: number,
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
            ctx.status = options.statusCode;
            ctx.body = 'Hello Tests!';
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
            204,
            302,
        ]
        .map((statusCode) => {
            it('logs successful request: ' + statusCode, async () => {
                setup({ statusCode });

                const response = await request.get('/');
                expect(response.status).toEqual(statusCode);
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
                expect(logOutput).toHaveLength(1);

                const data = logData[0];
                const expectedLog = `${data.timestamp} - ${statusCode} GET / - ${data.responseTime}ms`;

                expect(logOutput[0]).toEqual(expectedLog);
            });
        });

    });

});
