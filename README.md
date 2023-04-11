# sans-csrf

Cross-site request forgery protection. Will store an encrypted csrfToken as a cookie in the browser and/or in the session on the server.

## Installation

```sh
$ npm install sans-csrf
```

## API

### sansCSRF(options)

Options:

- `secret` - (_required if `cryptoUtility` is not provided_) - should be a string of 32 characters. Used by the crypto utility.
- `cookie` - (_default is `false`_) - should be a boolean. Set this to _`true`_ to store an encrypted csrfToken as a cookie in the browser.
- `cryptoUtility` - (_default is then object with the bundled `decrypt()` and `encrypt()` functions_) - should be an object with decrypt() and encrypt() functions. Set this to use AWS cryptographic services, for example.
    - `decrypt()` and `encrypt()` - these functions will be passed `csrfToken` as the first argument (a random uuid) and `secret` as the second argument (the above option). `decrypt()` is passed a third argument, `type`, a string of either `cookie` or `session`.
- `methods` - (_default is `['PATCH', 'POST', 'PUT']`_) - should be an array of strings. Set this as a subset of the default methods to not validate the csrfToken for the excluded method(s).
- `session` - (_default is `false`_) - should be a boolean. Set this to _`true`_ to store an encrypted csrfToken in the session on the server.
- `skipUrls` - (_default is `[]`_) - should be an array or strings and/or regex patterns. Set this to not validate the csrfToken for the given url and/or regex pattern.

Calling `sansCSRF()` returns a middleware function that will be passed the standard `req`, `res`, and `next` arguments.

When the middleware function is called, a `csrfToken()` function will be added to the `req` object in all cases. Calling `req.csrfToken()` will store an encrypted csrfToken as a cookie in the browser and/or in the session on the server, and will return the csrfToken unencrypted to be passed to your template before rendering:

```html
// ...the rest of your template

<form method="POST">
  <input name="csrfToken" value="{{ csrfToken }}" type="hidden"/>
  
  // ...the rest of your template

  <button type="submit"/>Submit</button>
</form>

// ...the rest of your template
```

When the middleware function is called, the `req.method` property matches any of the `methods` (the above option) and the `req.originalUrl` property doesn't match any `skipUrls` (the above option), the encrypted csrfToken stored as a cookie in the browser and/or in the session on the server will be validated against `req.body.csrfToken`.

## Examples

As a cookie:

```javascript
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');

const sansCSRF = require('sans-csrf');

// ...the rest of your required packages

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET || 'secret'));

// ...body-parser and cookie-parser are needed for sans-csrf to store the csrfToken as a cookie and validate against the csrfToken value returned in the body of a request

app.use(sansCSRF({
  cookie: true,
  secret: process.env.SANS_CSRF_SECRET || crypto.randomBytes(16).toString('hex'),
}));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();

  next();
});

// ...the rest of your application

```

In the session:

```javascript
const bodyParser = require('body-parser');
const crypto = require('crypto');
const express = require('express');
const expressSession = require('express-session');

const sansCSRF = require('sans-csrf');

// ...the rest of your required packages

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET || 'secret',
}));

// ...body-parser and express-session are needed for sans-csrf to store the csrfToken in the session and validate against the csrfToken value returned in the body of a request

app.use(sansCSRF({
  secret: process.env.SANS_CSRF_SECRET || crypto.randomBytes(16).toString('hex'),
  session: true,
}));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();

  next();
});

// ...the rest of your application

```

Both:

```javascript
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const expressSession = require('express-session');

const sansCSRF = require('../../index');

// ...the rest of your required packages

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET || 'secret'));

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET || 'secret',
}));

// ...body-parser, cookie-parser and express-session are needed for sans-csrf to store the csrfToken as a cookie, to store the csrfToken in the session and to validate against the csrfToken value returned in the body of a request

app.use(sansCSRF({
  cookie: true,
  secret: process.env.SANS_CSRF_SECRET || crypto.randomBytes(16).toString('hex'),
  session: true,
}));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();

  next();
});

// ...the rest of your application

```
