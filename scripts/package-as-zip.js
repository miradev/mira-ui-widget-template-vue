const AdmZip = require("adm-zip")
const fs = require("fs")
const path = require("path")

const cwd = process.cwd()
const distFolder = path.join(cwd, "dist")
const zip = new AdmZip()

const manifest = require("../src/manifest.json")

const dirents = fs.readdirSync(distFolder, { withFileTypes: true })

const fileNames = dirents
  .filter(dirent => dirent.isFile())
  .map(dirent => path.join(distFolder, dirent.name))

for (const filename of fileNames) {
  zip.addLocalFile(filename)
}

zip.writeZip(path.join(distFolder, manifest.id + ".zip"))
