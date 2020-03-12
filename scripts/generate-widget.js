const fs = require("fs")
const path = require("path")
const compiler = require("vue-template-compiler")
const ccu = require("@vue/component-compiler-utils")
const prettier = require("prettier")

const args = process.argv.slice(2)
const fileExt = ".vue"
const cwd = process.cwd()
const idTemplate = /--ID--/g

const prettierConfig = prettier.resolveConfig.sync(cwd)
prettierConfig.parser = "babel"

function kebabToPascalCase(str) {
  return str
    .split("-")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join("")
}

function widgetCode(renderFunctions, scriptCode, manifest) {
  const className = kebabToPascalCase(manifest.id)
  return `
  ${scriptCode.top}

  class __${kebabToPascalCase(className)} {
    setup() {
      // START OF: Compiled vue render functions DO NOT EDIT
  ${renderFunctions}
  this.vue = new Vue({
    render,
    staticRenderFns,
    el: \`#\${this.id}\`,
    ${scriptCode.props}
  })
  this.vue.$on("config", (config) => {
    if (config) {
      this.vue.$data["config"] = config
    }
  })
      // END OF: Compiled vue render functions DO NOT EDIT
    }
  
    get id() {
      return "${manifest.id}"
    }
  }

  wm.register(new __${className}())
  `
}

function compileVueSFCToWidget(fileContents, filename, manifest) {
  if (!idTemplate.test(fileContents)) {
    console.error(
      "The .vue source file is missing the '--ID--' identifier, which is required to be replaced as the 'id' value from the manifest.json.",
    )
    process.exit(1)
  }

  const expandedSource = fileContents.replace(idTemplate, manifest.id)

  // Read SFC as blocks
  const parse = ccu.parse({
    source: expandedSource,
    filename,
    compiler,
    needMap: false,
  })

  // Compile template block into render functions
  const templateRenderCode = ccu.compileTemplate({
    source: parse.template.content,
    compiler,
    filename,
    preprocessLang: parse.template.lang,
  }).code

  // Compile styles block into a single style string
  const styleCode = parse.styles
    .map(style =>
      ccu.compileStyle({
        filename,
        source: style.content,
        scoped: false,
        preprocessLang: style.lang,
      }),
    )
    .reduce((accum, currVal) => {
      return currVal.code + accum
    }, "")

  // Strip script code from export declaration
  const scriptRegex = /(^[\s\S]*)export.*?{([\s\S]+)}\n*$/
  const match = scriptRegex.exec(
    parse.script.content.substring(parse.script.content.lastIndexOf("//\n") + 3),
  )
  if (match.length < 3) {
    console.error(
      "An error occurred with parsing the script block, check to make sure that it is properly formatted and correct.",
    )
    process.exit(1)
    return
  }
  const scriptCode = {
    top: match[1],
    props: match[2],
  }

  return {
    js: widgetCode(templateRenderCode, scriptCode, manifest),
    css: styleCode,
  }
}

function validateManifest(manifest) {
  if (!manifest.id) {
    console.error("An 'id' field is required in the manifest")
    return false
  } else {
    if (/[^a-zA-Z-]/.test(manifest.id)) {
      console.error(
        "The 'id' field contains invalid characters! It should only contain characters a-z, A-Z, and '-'",
      )
      return false
    }
  }
  if (!manifest.name) {
    console.error("A 'name' field is required in the manifest")
    return false
  }
  if (!manifest.author) {
    console.error("An 'author' field is required in the manifest")
    return false
  }
  if (!manifest.version) {
    console.error("A 'version' field is required in the manifest")
    return false
  }
  return true
}

function sanitize(js) {
  const axiosRequirePattern = /.*require\(('|")axios('|")\).*/g
  const axiosImportPattern = /.*import axios from ('|")axios('|").*/g
  const momentRequirePattern = /.*require\(('|")moment('|")\).*/g
  let cleanedJs = js
    .replace(axiosRequirePattern, "")
    .replace(axiosImportPattern, "")
    .replace(momentRequirePattern, "")
  return `;(function() {
    ${cleanedJs}
  })();`
}

;(() => {
  if (args.length < 1) {
    console.error(
      "You must supply either a file in the src folder with .vue file extension, or a single string which will be expanded to target 'src/${string}/${string}.vue'",
    )
    process.exit(1)
  }

  let fileLocation = args[0]
  if (!args[0].endsWith(fileExt)) {
    const location = path.join(cwd, "src", fileLocation, fileLocation + fileExt)
    if (!fs.existsSync(location)) {
      console.error(`Argument supplied is neither a .vue file, nor does it exist in ${location}`)
      process.exit(1)
    }
    fileLocation = location
  }

  const filename = fileLocation
  const fileAsString = fs.readFileSync(filename, {
    encoding: "utf8",
  })
  const parentFolder = path.dirname(filename)
  const manifestDir = path.join(parentFolder, "manifest.json")
  const manifestContents = fs.readFileSync(manifestDir, {
    encoding: "utf8",
  })

  if (!manifestContents) {
    console.error(
      `A manifest.json file is required in the src folder to properly compile the Vue widget

Example:
  {
    "id": "my-widget",
    "name": "A Custom Widget",
    "version": "1.0.0",
    "author": "John Smith",
    "entrypoint": {
      "js": "main.js",
      "css": "main.css"
    }
  }`,
    )
    process.exit(1)
  }

  const manifest = JSON.parse(manifestContents)
  if (validateManifest(manifest)) {
    const output = compileVueSFCToWidget(fileAsString, filename, manifest)

    output.js = sanitize(output.js)

    const distFolder = path.join(cwd, "dist")
    if (!fs.existsSync(distFolder)) {
      fs.mkdirSync(distFolder)
    }

    fs.writeFileSync(
      path.join(distFolder, "../dist/main.js"),
      prettier.format(output.js, prettierConfig),
    )
    fs.writeFileSync(path.join(distFolder, "../dist/main.css"), output.css)
    fs.copyFileSync(manifestDir, path.join(distFolder, "manifest.json"))
  }
})()
