
import { getOptions } from '../logger';

describe('logger options', () => {

    describe('when NODE_ENV == "development"', () => {

        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('options.json = false', () => {
            expect(getOptions()).toHaveProperty('json', false);
        });

        it('options.json can be overridden', () => {
            expect(getOptions({ json: true })).toHaveProperty('json', true);
        });

    });

    describe('when NODE_ENV != "development"', () => {

        beforeEach(() => {
            process.env.NODE_ENV = 'something_else';
        });

        it('options.json = true', () => {
            expect(getOptions()).toHaveProperty('json', true);
        });

        it('options.json can be overridden', () => {
            expect(getOptions({ json: false })).toHaveProperty('json', false);
        });

    });

    describe('log output functions', () => {
        let stdoutWrite: any;
        let stdoutSpy: jest.Mock;

        beforeEach(() => {
            stdoutSpy = jest.fn();
            stdoutWrite = process.stdout.write;
            process.stdout.write = stdoutSpy;
        });
        afterEach(() => {
            process.stdout.write = stdoutWrite;
        });

        it('uses stdout for logs by default', () => {
            const options = getOptions();
            options.logFn('test_data');
            expect(stdoutSpy).toHaveBeenCalledWith('test_data');
        });

        it('can override log function', () => {
            const fn = jest.fn();
            const options = getOptions({ logFn: fn });
            expect(options.logFn).toBe(fn);
        });

    });

});
