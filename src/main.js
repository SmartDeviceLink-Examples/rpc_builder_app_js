import Vue from 'vue'
import App from './App.vue'
import VModal from 'vue-js-modal'

Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, 'apiSpec', {});
Object.defineProperty(Vue.prototype, 'sdlManager', {});

Vue.use(VModal);

new Vue({
  render: h => h(App),
}).$mount('#app')
