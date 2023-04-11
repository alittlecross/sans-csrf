const {
  createCipheriv, createDecipheriv, randomBytes, randomUUID,
} = require('crypto');

const assert = require('assert');

const acceptedMethods = ['PATCH', 'POST', 'PUT'];
const algorithm = 'aes-256-cbc';

const decrypt = (csrfToken, secret, type) => {
  const split = csrfToken.split(':');

  assert(split.length === 2, `req.${type}.csrfToken is malformed, it must be 2 parts separated by a colon`);

  const iv = Buffer.from(split[0], 'hex');

  const decipher = createDecipheriv(algorithm, secret, iv);

  return `${decipher.update(Buffer.from(split[1], 'hex'), 'hex', 'utf8')}${decipher.final('utf8')}`;
};

const encrypt = (csrfToken, secret) => {
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, secret, iv);

  return `${iv.toString('hex')}:${cipher.update(csrfToken, 'utf8', 'hex')}${cipher.final('hex')}`;
};

const middleware = ({
  cookie, cryptoUtility, methods, secret, session, skipUrls,
}) => (req, res, next) => {
  if (cookie) {
    assert(req.cookies, 'cookies missing from req');
    assert(req.signedCookies, 'signedCookies missing from req');
  }

  if (session) {
    assert(req.session, 'session missing from req');
  }

  req.csrfToken = () => {
    const csrfToken = randomUUID();
    const encrypted = cryptoUtility.encrypt(csrfToken, secret);

    if (cookie) {
      res.cookie('csrfToken', encrypted, {
        httpOnly: true,
        sameSite: 'strict',
        signed: true,
      });
    }

    if (session) {
      req.session.csrfToken = encrypted;
    }

    return csrfToken;
  };

  if (methods.includes(req.method) && !skipUrls.filter((e) => e === req.originalUrl || e.test?.(req.originalUrl)).length) {
    assert(req.body, 'body missing from req');
    assert(req.body.csrfToken, 'csrfToken missing from req.body');

    if (cookie) {
      assert(req.signedCookies.csrfToken, 'csrfToken missing from req.signedCookies');

      const decrypted = cryptoUtility.decrypt(req.signedCookies.csrfToken, secret, 'signedCookies');

      assert(req.body.csrfToken === decrypted, 'req.body.csrfToken does not match req.signedCookies.csrfToken');

      res.clearCookie('csrfToken');
    }

    if (session) {
      assert(req.session.csrfToken, 'csrfToken missing from req.session');

      const decrypted = cryptoUtility.decrypt(req.session.csrfToken, secret, 'session');

      assert(req.body.csrfToken === decrypted, 'req.body.csrfToken does not match req.session.csrfToken');

      delete req.session.csrfToken;
    }
  }

  return next();
};

module.exports = (args) => {
  const options = {
    cookie: false,
    cryptoUtility: {
      decrypt,
      encrypt,
    },
    methods: ['PATCH', 'POST', 'PUT'],
    session: false,
    skipUrls: [],
    ...args,
  };

  const {
    cookie, cryptoUtility, methods, secret, session, skipUrls,
  } = options;

  assert(args, 'args is missing');
  assert(typeof args === 'object' && !Array.isArray(args), 'args must be an object');

  if (!args.cryptoUtility) {
    assert(args.secret, 'secret is missing from args');
    assert(typeof secret === 'string', 'secret must be a string');
    assert(secret.length === 32, `secret must be 32 characters long; you provided ${secret.length}`);
  }

  assert(typeof cookie === 'boolean', 'cookie must be a boolean');
  assert(typeof cryptoUtility === 'object' && !Array.isArray(cryptoUtility), 'cryptoUtility must be an object');
  assert(cryptoUtility.decrypt, 'decrypt() is missing from cryptoUtility');
  assert(typeof cryptoUtility.decrypt === 'function', 'decrypt() must be a function');
  assert(cryptoUtility.encrypt, 'encrypt() is missing from cryptoUtility');
  assert(typeof cryptoUtility.encrypt === 'function', 'encrypt() must be a function');
  assert(Array.isArray(methods), 'methods must be an array');

  methods.forEach((e) => { assert(acceptedMethods.includes(e), `${typeof e === 'symbol' ? `Symbol(${e.description})` : e} is not an accepted method`); });

  assert(typeof session === 'boolean', 'session must be a boolean');
  assert(Array.isArray(skipUrls), 'skipUrls must be an array');

  skipUrls.forEach((e) => { assert(typeof e === 'string' || e.test, 'skipUrl must be a string or regex'); });

  return middleware(options);
};
