import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import VueFire from 'vuefire'
import ConfirmButton from './components/confirm-button.vue'

Vue.use(Vuetify)
Vue.use(VueFire)
Vue.config.productionTip = false
Vue.component('confirm-button', ConfirmButton)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})

