# koa-json-log

This is a simple [Koa](http://koajs.com/) middleware that outputs HTTP requests
and response codes as JSON data. During development these are shown in a 
human-readable format.

## Features

 * Zero-dependency. Logs are output to `stdout` and `stderr`.
 * Tools like [PM2](http://pm2.keymetrics.io/docs/usage/log-management/) can
   then be used to write logs to files if needed.
 * Development Mode (when `NODE_ENV` == `development`), shows human-readable logs.
 * TypeScript definitions

## Sample Output when `NODE_ENV` == `development`

```
200 GET / - 4ms
404 GET /favicon.ico - 1ms
500 GET /test - 24ms
Error: Ack nooo!!
    at router.get (/project/src/server/server.ts:18:11)
    at dispatch (/project/node_modules/koa-router/node_modules/koa-compose/index.js:44:32)
    at next (/project/node_modules/koa-router/node_modules/koa-compose/index.js:45:18)
    at /project/node_modules/koa-router/lib/router.js:346:16
    ...
200 GET /static/logo.png - 4ms
```

## Sample JSON Output (when `NODE_ENV` != `development`)

*(JSON data shown across multiple lines for readability)*

```json
{
  "timestamp": "2018-05-04T12:22:14.412Z",
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
  "timestamp": "2018-05-04T12:25:23.125Z",
  "method": "GET",
  "url": "/test",
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

We recommend registering `jsonLog()`  as one of the first `app.use()` calls, to
make sure all requests and errors are logged as expected.

```ts
import * as Koa from 'koa';
import { jsonLog } from 'koa-json-log';

const app = new Koa();
app.use(jsonLog());
...
```

## Options

The following options can be passed to `jsonLog()` (as an object):

 * `json` - boolean - enable / disable JSON format (by default this is based on
   `NODE_ENV`)
 * `onLog` - function - you can override this function to intercept and modify
   the log data object before it is written to the log. 
 * `logFn` - function - override this function to redirect your log output. It is
   called with every log line. By default this is set to `process.stdout.write`.

## Error Details

When throwing errors from middleware, `jsonLog()` will pick up and log the
following properties from `Error` objects:

 * `message` - the error message
 * `expose` - a *boolean* indicating whether the error message should be returned
   to the client in the HTTP response
 * `status` - the http status to return
 * `stack` - the error stack trace (never returned to the client)
 * `data` - additional JSON data to log (never returned to the client)

## TODO List

 * More options
 * Probably some other things!

Pull requests welcome!

## License

MIT
