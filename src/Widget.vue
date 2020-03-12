<template lang="pug">
  #--ID--
    p {{ time }}
</template>

<script>
const moment = require("moment")

export default {
  data() {
    return {
      time: "",
      config: null,
    }
  },

  methods: {
    updateTime() {
      if (this.config && this.config.format) {
        this.time = moment().format(this.config.format)
      } else {
        this.time = moment().format("hh : mm : ss A")
      }
    },
  },

  mounted() {
    this.updateTime()
    setInterval(() => {
      this.updateTime()
    }, 1000)
  },
}
</script>

<style lang="sass">
@import url("https://fonts.googleapis.com/css?family=Roboto")

#--ID--
  font-size: 80px
  font-family: "Roboto"
  color: #daf6ff
  text-shadow: 0 0 20px rgba(10, 175, 230, 1),  0 0 20px rgba(10, 175, 230, 0)
</style>
