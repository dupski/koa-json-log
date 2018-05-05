
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

        it('uses stdout for logs by default', () => {
            const options = getOptions();
            expect(options.logFn).toBe(process.stdout.write);
        });

        it('can override log function', () => {
            const fn = jest.fn();
            const options = getOptions({ logFn: fn });
            expect(options.logFn).toBe(fn);
        });

    });

});
