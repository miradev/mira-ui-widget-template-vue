const AdmZip = require("adm-zip")
const fs = require("fs")
const path = require("path")

const cwd = process.cwd()
const distFolder = path.join(cwd, "dist")
const zip = new AdmZip()

const manifest = require(path.join(distFolder, "manifest.json"))

const dirents = fs.readdirSync(distFolder, { withFileTypes: true })

const fileNames = dirents
  .filter(dirent => dirent.isFile())
  .filter(dirent => !dirent.name.endsWith(".zip"))
  .map(dirent => path.join(distFolder, dirent.name))

console.log(`Packaging the following files into '${manifest.id}.zip': `, fileNames)

for (const filename of fileNames) {
  zip.addLocalFile(filename)
}

zip.writeZip(path.join(distFolder, manifest.id + ".zip"))
