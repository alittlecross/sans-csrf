module.exports = {
  env: {
    jest: true,
  },
  extends: ['plugin:jest/recommended'],
  plugins: ['jest'],
  rules: {
    'no-nested-ternary': 0,
    'no-underscore-dangle': 0,
  },
};
