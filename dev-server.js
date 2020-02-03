import Vue from "vue"
import Widget from "@/Widget.vue"

Vue.config.productionTip = false

new Vue({
  render: function(h) {
    return h(Widget)
  },
}).$mount("#app")
