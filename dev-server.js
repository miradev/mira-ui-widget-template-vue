import Vue from "vue"
const Widget = require("@/" + process.env.SRC).default

Vue.config.productionTip = false

new Vue({
  render: function(h) {
    return h(Widget)
  },
}).$mount("#app")
