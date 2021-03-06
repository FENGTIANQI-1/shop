import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

import './assets/css/globall.css'

import ElementUI from 'element-ui';

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'


Vue.use(ElementUI);
Vue.use(VueQuillEditor);
// Vue.prototype.$http = axios
// axios.defaults.baseURL = 'http://www.ysqorz.top:8888/api/private/v1/'

Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
