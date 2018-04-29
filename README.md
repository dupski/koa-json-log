# koa-json-log

This is a simple [Koa](http://koajs.com/) middleware that outputs HTTP Requests
and Responses as JSON.

## Features

 * Zero-dependency. Logs are output to `stdout` and `stderr`.
 * Tools like [PM2](http://pm2.keymetrics.io/docs/usage/log-management/) can
   then be used to write logs to files if needed.
 * Development Mode (when `NODE_ENV` == `development`), shows human-readable logs.
 * TypeScript definitions

## Sample Output when `NODE_ENV` == `development`

### Access logs

```
200 GET / - 4ms
404 GET /favicon.ico - 1ms
404 GET /test - 1ms
```

### Error logs

```
200 GET / - 4ms
500 GET /test - 24ms
Error: Ack nooo!!
    at router.get (/project/src/server/server.ts:18:11)
    at dispatch (/project/node_modules/koa-router/node_modules/koa-compose/index.js:44:32)
    at next (/project/node_modules/koa-router/node_modules/koa-compose/index.js:45:18)
    at /project/node_modules/koa-router/lib/router.js:346:16
    ...
```

## Sample JSON Output (when `NODE_ENV` != `development`)

*(JSON data shown across multiple lines for readability)*

### Access logs

```json
{
  "method": "GET",
  "url": "/",
  "query": {},
  "remoteAddress": "127.0.0.1",
  "host": "localhost:3000",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
  "statusCode": 200,
  "responseTime": 7
}
{
  "method": "GET",
  "url": "/blog",
  "query": {},
  "remoteAddress": "127.0.0.1",
  "host": "localhost:3000",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
  "statusCode": 200,
  "responseTime": 12
}
```

### Error logs

```json
{
  "method": "GET",
  "url": "/test",
  "query": {},
  "remoteAddress": "127.0.0.1",
  "host": "localhost:3000",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
  "statusCode": 404,
  "responseTime": 2
}
{
  "method": "GET",
  "url": "/",
  "query": {},
  "remoteAddress": "127.0.0.1",
  "host": "localhost:3000",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36",
  "errorMessage": "Ack nooo!!",
  "errorStack": "Error: Ack nooo!!\n    at router.get (/src/server/server.ts:18:11)\n  ...",
  "statusCode": 500,
  "responseTime": 18
}
```

## Installation

```
npm install koa-json-log
```

## Usage

We recommend registering the `logger` as one of the first `app.use()` calls, to
make sure all requests and errors are logged as expected.

```ts
import * as Koa from 'koa';
import { logger } from 'koa-json-log';

const app = new Koa();
app.use(logger);
```

## TODO List

 * Tests
 * Configurable options
 * Probably some other things!

Pull requests welcome!

## License

MIT
