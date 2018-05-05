
import * as Koa from 'koa';
import { Server } from 'http';
import { agent, SuperTest, Test } from 'supertest';

import { jsonLog } from '../index';
import { ILogData } from '../logger';

describe('logger', () => {
    let server: Server;
    let request: SuperTest<Test>;
    let logData: ILogData[];
    let requestLog: string[];
    let errorLog: string[];

    function setup(options: {
        statusCode: number,
    }) {
        const app = new Koa();
        logData = [];
        requestLog = [];
        errorLog = [];
        app.use(jsonLog({
            onLog: (data) => {
                logData.push(data);
            },
            requestLogFn: (data) => {
                requestLog.push(data); return true;
            },
            errorLogFn: (data) => {
                errorLog.push(data); return true;
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

        it('logs successful request', async () => {
            setup({ statusCode: 200 });

            const response = await request.get('/');
            expect(response.status).toEqual(200);
            expect(errorLog).toHaveLength(0);
            expect(requestLog).toHaveLength(1);

            const data = logData[0];
            const expectedLog = `200 GET / - ${data.responseTime}ms`;

            expect(requestLog[0]).toEqual(expectedLog);
        });

    });

});
