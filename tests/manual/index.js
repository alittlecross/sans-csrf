const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const express = require('express');
const expressSession = require('express-session');
const nunjucks = require('nunjucks');

const sansCSRF = require('../../index');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_PARSER_SECRET || 'secret'));

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: process.env.EXPRESS_SESSION_SECRET || 'secret',
}));

app.use(sansCSRF({
  cookie: true,
  secret: process.env.SANS_CSRF_SECRET || crypto.randomBytes(16).toString('hex'),
  session: true,
}));

app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();

  next();
});

app.set('view engine', 'njk');

nunjucks.configure('tests/manual/views', {
  express: app,
});

app.get('/', (req, res) => {
  res.render('index.njk');
});

app.post('/', (req, res) => {
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`); // eslint-disable-line no-console
});
