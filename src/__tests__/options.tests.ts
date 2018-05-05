
import { getOptions } from '../logger';

describe('logger options', () => {

    describe('when NODE_ENV == "development"', () => {

        beforeEach(() => {
            process.env.NODE_ENV = 'development';
        });

        it('options.jsonLog = false', () => {
            expect(getOptions()).toHaveProperty('jsonLog', false);
        });

        it('options.jsonLog can be overridden', () => {
            expect(getOptions({ jsonLog: true })).toHaveProperty('jsonLog', true);
        });

    });

    describe('when NODE_ENV != "development"', () => {

        beforeEach(() => {
            process.env.NODE_ENV = 'something_else';
        });

        it('options.jsonLog = true', () => {
            expect(getOptions()).toHaveProperty('jsonLog', true);
        });

        it('options.jsonLog can be overridden', () => {
            expect(getOptions({ jsonLog: false })).toHaveProperty('jsonLog', false);
        });

    });

    describe('log output functions', () => {

        it('uses stdout for request logs by default', () => {
            const options = getOptions();
            expect(options.requestLogFn).toBe(process.stdout.write);
        });

        it('uses stderr for error logs by default', () => {
            const options = getOptions();
            expect(options.errorLogFn).toBe(process.stderr.write);
        });

        it('can override request log function', () => {
            const fn = jest.fn();
            const options = getOptions({ requestLogFn: fn });
            expect(options.requestLogFn).toBe(fn);
        });

        it('can override error log function', () => {
            const fn = jest.fn();
            const options = getOptions({ errorLogFn: fn });
            expect(options.errorLogFn).toBe(fn);
        });

    });

});
