module.exports = {
  chainWebpack: config => {
    config.set('externals', {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      axios: 'axios',
      lodash: '_',
      echarts: 'echarts',
      nprogress: 'NProgress',
      'vue-quill-editor': 'VueQuillEditor'
    })
  }
}
