# mira-ui-widget-template-vue

This repository is a template repository that contains all the setup and scripts needed to build a mira-ui widget that uses the Vue.js (2.X) framework.

## Setup

To get started, clone this repository and set it up with the `yarn install` command.

## Developing your widget

Local development can be done by starting up a local vue dev server with hot-reloading using `yarn install`.

Check the `Widget.vue` file in the `src` folder as a baseline example.

A `manifest.json` file is used to define the file bundles required by your widget for loading.

Example manifest.json:

```json
{
  "id": "clock",
  "name": "Clock",
  "version": "1.0.0",
  "author": "Mira",
  "entrypoint": {
    "js": "main.js",
    "css": "main.css"
  }
}
```

For this template repository using vue, you may leave the entrypoint as default. The other fields can be edited as necessary.

* id - a unique identifier for the widget, used by the marketplace and for rendering the widget (the root div will have it's id attribute set to this). Note that every widget should have a unique id, as the marketplace will not accept two different widgets with overlapping ids (a widget may only be updated with version bumps once it exists in the marketplace). **Please keep the id as all lower-case with hyphens separating words and phrases (no spaces.**
* name - a user friendly name for the widget
* version - the version of the widget
* author - the author of the widget
* entrypoint - used to define the single javascript and css bundle files to load. For this template repository, this should be left as default.

### Caveats (what is --ID-- ?)

Notice that the `<template>` and `<style>` blocks in the .vue file reference a div named `--ID--`. This is the root div corresponding to your widget and is required and should not be removed. It is a temporary variable name that will be replaced with the ID set in the `manifest.json` when the widget is built.

You may edit your manifest.json file to have a different `id` field.
**Note that your widget must have a unique ID as any two widgets with a clashing ID will not be loaded!**

## What if my widget needs to send HTTP requests?

Use the [axios](https://github.com/axios/axios) library. Add `import axios from "axios"` to the top of the `<script>` block in your `Widget.vue` file. (This import statement will be removed when the widget is built.)

e.g.

```vue
<script>
import axios from "axios"

...
my vue widget code here
use axios anywhere here
...
</script>
```

## Building your widget

Build your .css, .js, and manifest.json bundle using

```
yarn build src/Widget.vue
```

Package it as a zip using

```
yarn package
```

This will create a `.zip` file in the `dist` directory using the id name specified in the manifest.json file.
