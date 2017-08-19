import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import VueFire from 'vuefire'

Vue.use(Vuetify)
Vue.use(VueFire)
Vue.config.productionTip = false

Vue.component('confirm-button',{
  props:['onConfirm', 'confirmText', 'item'],
  template:`<span @click.stop.prevent='onClick'><slot></slot></span>`,
  methods:{
    onClick(){
      if (confirm(this.confirmText))
        this.onConfirm(this.item)
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})

