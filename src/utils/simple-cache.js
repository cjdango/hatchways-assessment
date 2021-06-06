module.exports = function makeSimpleCache(fn, { keyPrefix = '', makeKey }) {
  const cache = {};

  return function simpleCache(params) {
    const key = `__${keyPrefix}__${makeKey(fn.name, params)}`;

    if (key in cache) {
      return cache[key];
    }

    cache[key] = fn(params);
    return cache[key];
  }
}