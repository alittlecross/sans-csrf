const crypto = require('crypto');

const {
  array, bigint, boolean, function_, null_, number, object, string, symbol, undefined_,
} = require('../utils/types');

const sansCSRF = require('../../index');

const secret = crypto.randomBytes(16).toString('hex');

describe('index.js', () => {
  describe('mandatory', () => {
    describe('args', () => {
      it('should throw an error when args is missing', () => {
        const input = () => {
          sansCSRF();
        };

        expect(input).toThrow('args is missing');
      });

      [array, bigint, boolean, function_, number, string, symbol].forEach((e) => {
        it(`should throw an error when args is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF(e.value);
          };

          expect(input).toThrow('args must be an object');
        });
      });
    });

    describe('secret', () => {
      it('should throw an error when secret is missing', () => {
        const input = () => {
          sansCSRF({});
        };

        expect(input).toThrow('secret is missing from args');
      });

      [array, bigint, boolean, function_, number, object, symbol].forEach((e) => {
        it(`should throw an error when secret is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              secret: e.value,
            });
          };

          expect(input).toThrow('secret must be a string');
        });
      });

      it('should throw an error when secret is a string less than 32 characters', () => {
        const input = () => {
          sansCSRF({
            secret: crypto.randomBytes(15).toString('hex'),
          });
        };

        expect(input).toThrow('secret must be 32 characters long; you provided 30');
      });

      it('should throw an error when secret is a string more than 32 characters', () => {
        const input = () => {
          sansCSRF({
            secret: crypto.randomBytes(17).toString('hex'),
          });
        };

        expect(input).toThrow('secret must be 32 characters long; you provided 34');
      });

      it('should not throw an error when secret is a string of 32 characters', () => {
        const input = () => {
          sansCSRF({
            secret,
          });
        };

        expect(input).not.toThrow();
      });
    });
  });

  describe('optional', () => {
    describe('cookie', () => {
      [array, bigint, function_, null_, number, object, string, symbol, undefined_].forEach((e) => {
        it(`should throw an error when cookie is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              cookie: e.value,
              secret,
            });
          };

          expect(input).toThrow('cookie must be a boolean');
        });
      });

      it('should not throw an error when cookie is true', () => {
        const input = () => {
          sansCSRF({
            cookie: true,
            secret,
          });
        };

        expect(input).not.toThrow();
      });

      it('should not throw an error when cookie is false', () => {
        const input = () => {
          sansCSRF({
            cookie: true,
            secret,
          });
        };

        expect(input).not.toThrow();
      });
    });

    describe('cryptoUtility', () => {
      [array, bigint, boolean, function_, number, string, symbol].forEach((e) => {
        it(`should throw an error when cryptoUtility is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              cryptoUtility: e.value,
            });
          };

          expect(input).toThrow('cryptoUtility must be an object');
        });
      });

      it('should throw an error when decrypt() is missing from cryptoUtility', () => {
        const input = () => {
          sansCSRF({
            cryptoUtility: {},
          });
        };

        expect(input).toThrow('decrypt() is missing from cryptoUtility');
      });

      [array, bigint, boolean, number, object, string, symbol].forEach((e) => {
        it(`should throw an error when decrypt() is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              cryptoUtility: {
                decrypt: e.value,
              },
            });
          };

          expect(input).toThrow('decrypt() must be a function');
        });
      });

      it('should throw an error when encrypt() is missing from cryptoUtility', () => {
        const input = () => {
          sansCSRF({
            cryptoUtility: {
              decrypt: () => {},
            },
          });
        };

        expect(input).toThrow('encrypt() is missing from cryptoUtility');
      });

      [array, bigint, boolean, number, object, string, symbol].forEach((e) => {
        it(`should throw an error when encrypt() is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              cryptoUtility: {
                decrypt: () => {},
                encrypt: e.value,
              },
            });
          };

          expect(input).toThrow('encrypt() must be a function');
        });
      });

      it('should not throw an error when cryptoUtility is an object with decrypt and encrypt functions', () => {
        const input = () => {
          sansCSRF({
            cryptoUtility: {
              decrypt: () => {},
              encrypt: () => {},
            },
          });
        };

        expect(input).not.toThrow();
      });
    });

    describe('methods', () => {
      [bigint, boolean, function_, null_, number, object, string, symbol, undefined_].forEach((e) => [
        it(`should throw an error when methods is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              methods: e.value,
              secret,
            });
          };

          expect(input).toThrow('methods must be an array');
        }),
      ]);

      [array, bigint, boolean, function_, null_, number, object, string, symbol, undefined_].forEach((e) => {
        it(`should throw an error when methods includes ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              methods: [e.value],
              secret,
            });
          };

          expect(input).toThrow(`${typeof e.value === 'symbol' ? `Symbol(${e.value.description})` : e.value} is not an accepted method`);
        });
      });

      it('should not throw an error when methods contains PATCH, POST and PUT', () => {
        const input = () => {
          sansCSRF({
            methods: ['PATCH', 'POST', 'PUT'],
            secret,
          });
        };

        expect(input).not.toThrow();
      });
    });

    describe('session', () => {
      [array, bigint, function_, null_, number, object, string, symbol, undefined_].forEach((e) => {
        it(`should throw an error when session is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              session: e.value,
              secret,
            });
          };

          expect(input).toThrow('session must be a boolean');
        });
      });

      it('should not throw an error when session is true', () => {
        const input = () => {
          sansCSRF({
            session: true,
            secret,
          });
        };

        expect(input).not.toThrow();
      });

      it('should not throw an error when session is false', () => {
        const input = () => {
          sansCSRF({
            session: true,
            secret,
          });
        };

        expect(input).not.toThrow();
      });
    });

    describe('skipUrls', () => {
      [bigint, boolean, function_, null_, number, object, string, symbol, undefined_].forEach((e) => [
        it(`should throw an error when skipUrls is ${e.ia}${e.type}`, () => {
          const input = () => {
            sansCSRF({
              secret,
              skipUrls: e.value,
            });
          };

          expect(input).toThrow('skipUrls must be an array');
        }),
      ]);

      it('should not throw an error when skipUrls contains strings and regex patterns', () => {
        const input = () => {
          sansCSRF({
            secret,
            skipUrls: ['hello world', /hello world/],
          });
        };

        expect(input).not.toThrow();
      });
    });
  });
});
