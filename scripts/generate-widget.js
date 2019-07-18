const fs = require("fs")
const path = require("path")
const compiler = require("vue-template-compiler")
const ccu = require("@vue/component-compiler-utils")
const prettier = require("prettier")

const args = process.argv.slice(2)
const fileExt = ".vue"
const cwd = process.cwd()

if (args.length < 1) {
  console.error("You must supply a file in the src folder with .vue file extension")
  process.exit(1)
  return
}

if (!args[0].endsWith(fileExt)) {
  console.error("File supplied must be a .vue file!")
  process.exit(1)
  return
}

const prettierConfig = prettier.resolveConfig.sync(cwd)
prettierConfig.parser = "babel"

function widgetCode(renderFunctions, scriptCode, manifest) {
  return `
  ${scriptCode.top}

  class __${manifest.id} {
    setup() {
      // START OF: Compiled vue render functions DO NOT EDIT
  ${renderFunctions}
  this.vue = new Vue({
    render,
    staticRenderFns,
    el: \`#\${this.id}\`,
    ${scriptCode.props}
  })
      // END OF: Compiled vue render functions DO NOT EDIT
    }
  
    get id() {
      return "${manifest.id}"
    }
  }
  
  wm.register(new __${manifest.id}())
  `
}

function compileVueSFCToWidget(fileContents, filename, manifest) {
  const expandedSource = fileContents.replace(/--NAME--/g, manifest.id)

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
    if (/[^a-zA-Z]/.test(manifest.id)) {
      console.error(
        "The 'id' field contains invalid characters! It should only contain letter characters a-z and A-Z",
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

;(() => {
  const filename = args[0]

  const fileAsString = fs.readFileSync(path.join(cwd, "src", filename), {
    encoding: "utf8",
  })
  const manifestContents = fs.readFileSync(path.join(cwd, "src", "manifest.json"), {
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
      }
      `,
    )
    process.exit(1)
    return
  }

  const manifest = JSON.parse(manifestContents)
  if (validateManifest(manifest)) {
    const output = compileVueSFCToWidget(fileAsString, filename, manifest)

    const distFolder = path.join(cwd, "dist")
    if (!fs.existsSync(distFolder)) {
      fs.mkdirSync(distFolder)
    }

    fs.writeFileSync(
      path.join(distFolder, "../dist/main.js"),
      prettier.format(output.js, prettierConfig),
    )
    fs.writeFileSync(path.join(distFolder, "../dist/main.css"), output.css)
    fs.copyFileSync(path.join(cwd, "src", "manifest.json"), path.join(distFolder, "manifest.json"))
  }
})()
