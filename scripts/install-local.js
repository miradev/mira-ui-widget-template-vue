const fs = require("fs")
const path = require("path")

const homedir = require("os").homedir

const miraDirectory = path.join(homedir(), ".mira")
const miraWidgetsFolder = path.join(miraDirectory, "widgets")

const cwd = process.cwd()
const distFolder = path.join(cwd, "dist")
const zipFiles = fs
  .readdirSync(distFolder, { withFileTypes: true })
  .filter(dirent => dirent.isFile() && dirent.name.toLowerCase().endsWith(".zip"))
  .map(dirent => dirent.name)

if (!fs.existsSync(miraWidgetsFolder)) {
  fs.mkdirSync(miraWidgetsFolder)
}

zipFiles.forEach(file => {
  console.log(`Copying ${file} to ${miraWidgetsFolder}`)
  fs.copyFileSync(path.join(distFolder, file), path.join(miraWidgetsFolder, file))
})
