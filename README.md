# mira-ui-widget-template-vue

To use `axios` in the widget for HTTP requests, add `import axios from "axios"` to the top of the `<script>` block. This import statement will be removed when the widget is built.

## Project setup
```
yarn install
```

### Start local server for development with hot-reloading
```
yarn serve
```

### Compile and minify widget for use in mira-ui
```
yarn build
```

### Package compiled widget as a zip file (assumes `yarn build` was run)
```
yarn run build
```

### Lints and fixes files
```
yarn run lint
```
