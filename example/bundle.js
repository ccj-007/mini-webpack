//先解决命名冲突，es模块不支持嵌套，所以使用cjs
//改造require，能够自动映射到对应的文件
//在require，执行mainjs文件

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

  require(1)
})({
  1:
    [function (require, module, exports) {
      const { foo } = require('./foo.js')
      foo()
      console.log('main');
    },
    { "./foo.js": 2 }
    ],
  2:
    [function (require, module, exports) {
      function foo () {
        console.log('foo');
      }
      module.exports = {
        foo
      }
    }, {}]
})

