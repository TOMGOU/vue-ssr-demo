import Vue from 'vue'
import App from './App.vue'
// import router from './router'
import createRouter from './router/index';

Vue.config.productionTip = false

const createApp = context => {
  const router = createRouter()

  const app = new Vue({
    router,
    render: h => h(App)
  }).$mount('#app')

  return {
    router,
    app
  }
}

export default createApp
