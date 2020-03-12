import Vue from "vue"
const Widget = require("@/" + process.env.SRC)

Vue.config.productionTip = false

new Vue({
  render: function(h) {
    return h(Widget)
  },
}).$mount("#app")
