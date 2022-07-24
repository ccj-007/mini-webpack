/**
 * @description 打包主入口
 */

import fs from "fs";
import path from "path";
import ejs from "ejs";
import parser from "@babel/parser";
import traverse from '@babel/traverse'
import { transformFromAst } from 'babel-core'
import { jsonLoader } from "./jsonLoader.js";
import { ChangeOutputPath } from "./ChangeOutputPath.js";
import { SyncHook } from "tapable";


let id = 0

const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader]
      }
    ]
  },
  plugins: [new ChangeOutputPath()]
}

const hooks = {
  emitFile: new SyncHook(['context'])  //同步hooks
}

function initPlugins () {
  const plugins = webpackConfig.plugins
  plugins.forEach(plugin => {
    plugin.apply(hooks)
  })
}

initPlugins()

//创建静态ast
function createAsset (filePath) {
  //获取文件的内容
  //获取文件的依赖
  //ast的抽象语法树   或者正则

  let source = fs.readFileSync(filePath, {
    encoding: 'utf-8'
  })

  //init loaders
  const loaders = webpackConfig.module.rules
  const loaderContext = {
    addDeps (dep) {
      console.log("addDeps", dep);
    }
  }

  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      if (Array.isArray(use)) {
        //fn为转换的loader函数
        use.reverse().forEach(fn => {
          source = fn.call(loaderContext, source)
        })
      } else {
        source = use(source)
      }
    }
  })


  //获取ast语法依赖树
  const ast = parser.parse(source, {
    sourceType: 'module'
  })

  const deps = []
  traverse.default(ast, {
    ImportDeclaration ({ node }) {
      //获取依赖的路径path
      deps.push(node.source.value)
    }
  })

  //esm 转为cjs
  const { code } = transformFromAst(ast, null, {
    presets: ['env']
  })

  return {
    filePath,
    code,
    deps,
    mapping: {},
    id: id++
  }
}

//创建依赖关系
function createGraph () {
  const mainAsset = createAsset('./example/main.js')

  const queue = [mainAsset]

  //在mainjs中的依赖继续去获取子依赖
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve('./example', relativePath))
      asset.mapping[relativePath] = child.id
      queue.push(child)
    })
  }
  return queue
}



const graph = createGraph()

function build (graph) {
  const template = fs.readFileSync('./bundle.ejs', {
    encoding: 'utf-8'
  })
  const data = graph.map(asset => {
    return {
      id: asset.id,
      code: asset.code,
      mapping: asset.mapping
    }
  })
  console.log(data);
  //传入ejs渲染
  const code = ejs.render(template, { data })
  let outputPath = './dist/bundle.js'

  const context = {
    changeOutputPath (path) {
      outputPath = path
    }
  }
  hooks.emitFile.call(context)
  fs.writeFileSync(outputPath, code)
}
build(graph)
