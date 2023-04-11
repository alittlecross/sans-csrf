const array = {
  ia: 'an ',
  type: 'array',
  value: [],
};

const bigint = {
  ia: 'a ',
  type: 'bigint',
  value: 1n,
};

const boolean = {
  ia: 'a ',
  type: 'boolean',
  value: true,
};

const function_ = {
  ia: 'a ',
  type: 'function',
  value: () => {},
};

const null_ = {
  ia: '',
  type: 'null',
  value: null,
};

const number = {
  ia: 'a ',
  type: 'number',
  value: 1,
};

const object = {
  ia: 'an ',
  type: 'object',
  value: {},
};

const string = {
  ia: 'a ',
  type: 'string',
  value: 'hello world',
};

const symbol = {
  ia: 'a ',
  type: 'symbol',
  value: Symbol('hello world'),
};

const undefined_ = {
  ia: '',
  type: 'undefined',
  value: undefined,
};

module.exports = {
  array,
  bigint,
  boolean,
  function_,
  null_,
  number,
  object,
  string,
  symbol,
  undefined_,
};
