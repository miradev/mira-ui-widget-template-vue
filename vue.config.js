const { argv } = require("yargs")

module.exports = {
  chainWebpack: config => {
    config.plugin("define").tap(options => {
      options[0]["process.env"].SRC = `"${argv.src}"`
      return options
    })
  },
}
