import Vue from "vue"
import ExampleWidget from "@/ExampleWidget.vue"

Vue.config.productionTip = false

new Vue({
  render: function(h) {
    return h(ExampleWidget)
  },
}).$mount("#app")
