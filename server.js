const express = require('express')
const path = require('path')
const MemoryFS = require('memory-fs')
const fs = require('fs')
const axios = require('axios');
const webpack = require('webpack')
const favicon = require('serve-favicon')
const vueServerRenderer = require('vue-server-renderer')

const server = express()

// webpack配置文件
const webpackConfig = require('@vue/cli-service/webpack.config')
// 编译webpack配置文件
const serverCompiler = webpack(webpackConfig);
const mfs = new MemoryFS();
// 指定输出文件到的内存流中
serverCompiler.outputFileSystem = mfs;

// 监听文件修改，实时编译获取最新的 vue-ssr-server-bundle.json
let bundle;
serverCompiler.watch({}, (err, stats) => {
  if (err) {
    throw err
  }
  const statsJson = stats.toJson()
  statsJson.errors.forEach(error => console.error(error))
  statsJson.warnings.forEach(warn => console.warn(warn))
  const bundlePath = path.join(webpackConfig.output.path, 'vue-ssr-server-bundle.json')
  bundle = JSON.parse(mfs.readFileSync(bundlePath, 'utf-8'))
  console.log('new bundle generated')
})

// step-1: 处理favicon
server.use(favicon(path.join(__dirname, './public', 'favicon.ico')))

// step-2: 开放dist/client目录，关闭默认下载index页的选项，不然到不了后面路由
server.use(express.static(path.resolve(__dirname, './dist/client'), { index: false }))

// step-3: 创建渲染器
const { createBundleRenderer } = vueServerRenderer
const template = fs.readFileSync(path.resolve(__dirname, './public/index.html'), 'utf-8')

server.get('*', async (req, res) => {
  const clientManifestResp = await axios.get(
    `http://127.0.0.1:8080/vue-ssr-client-manifest.json`,
  )
  const clientManifest = clientManifestResp.data
  // const clientManifest = JSON.parse(mfs.readFileSync(path.resolve(__dirname, './dist/client/vue-ssr-client-manifest.json'), 'utf-8'))
  const renderer = createBundleRenderer(bundle, {
    template,
    clientManifest
  })
  const context = {
    title: 'ssr demo',
    url: req.url
  }
  const html = await renderer.renderToString(context)
  res.send(html)
})

server.listen(3000, () => {
  console.log('server is running at port 3000')
})
