const express = require('express')
const path = require('path')
const MemoryFS = require('memory-fs')
const fs = require('fs')
const axios = require('axios');
const webpack = require('webpack')
const favicon = require('serve-favicon')
const vueServerRenderer = require('vue-server-renderer')

const server = express()

// step-1: 处理favicon
server.use(favicon(path.join(__dirname, './public', 'favicon.ico')))

// step-2: 开放dist/client目录，关闭默认下载index页的选项，不然到不了后面路由
server.use(express.static(path.resolve(__dirname, './dist/client'), { index: false }))

// step-3: 创建渲染器
const { createBundleRenderer } = vueServerRenderer
const bundle = require(path.resolve(__dirname, './dist/server/vue-ssr-server-bundle.json'))
const template = fs.readFileSync(path.resolve(__dirname, './public/index.html'), 'utf-8')
const clientManifest = require(path.resolve(__dirname, './dist/client/vue-ssr-client-manifest.json'))
const renderer = createBundleRenderer(bundle, {
  template,
  clientManifest
})

server.get('*', async (req, res) => {
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