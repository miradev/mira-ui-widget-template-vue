<template lang="pug">
  #--ID--
    p {{ time }}
</template>

<script>
function padDigits(num) {
  return num.toString().padStart(2, "0")
}

export default {
  data() {
    return {
      time: "",
    }
  },

  methods: {
    updateTime() {
      const date = new Date()
      let hours = date.getHours()
      let meridiem = "AM"
      if (hours > 12) {
        hours -= 12
        meridiem = "PM"
      }
      const minutes = date.getMinutes()
      const seconds = date.getSeconds()

      this.time = `${padDigits(hours)} : ${padDigits(minutes)} : ${padDigits(seconds)} ${meridiem} `
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
