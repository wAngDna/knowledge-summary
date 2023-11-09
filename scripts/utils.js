'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.printObject = void 0
function printObject(object, method) {
  if (method === void 0) {
    method = 'log'
  }
  for (var _i = 0, _a = Object.entries(object); _i < _a.length; _i++) {
    var _b = _a[_i],
      key = _b[0],
      value = _b[1]
    // eslint-disable-next-line no-console
    console[method](''.concat(key, ':\n').concat(value, '\n'))
  }
}
exports.printObject = printObject
