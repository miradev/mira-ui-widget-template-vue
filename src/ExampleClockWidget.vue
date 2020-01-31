<template lang="pug">
  #--ID--
  p {{ time }}
</template>

<script>
export default {
  data() {
    return {
      time: "",
    }
  },

  methods: {
    updateTime() {
      const date = new Date()
      this.time = `${date.getHours()} : ${date.getMinutes()} : ${date.getSeconds()}`
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
