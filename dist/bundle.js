(function (modules) {
function require (id) {
const [fn, mapping] = modules[id]
const module = {
exports: {}
}

//根据map映射找到对应的id
function localRequire (filePath) {
const id = mapping[filePath]
return require(id)
}
//找到映射后执行, 为了在子函数中也能处理依赖将cjs导入
fn(localRequire, module, module.exports)

return module.exports
}

require(0)
})({


  0 : [function (require, module, exports) {
    "use strict";

var _foo = require("foo.js");

var _foo2 = _interopRequireDefault(_foo);

var _user = require("./user.json");

var _user2 = _interopRequireDefault(_user);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _foo2.default)();
console.log(_user2.default);
console.log('main');
      }, {"foo.js":1,"./user.json":2}],

        
  1 : [function (require, module, exports) {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function foo() {
  console.log('foo');
}

exports.default = foo;
      }, {}],

        
  2 : [function (require, module, exports) {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = "{\r\n  \"name\": \"chen\",\r\n  \"age\": 13\r\n}";
      }, {}],

        

          })