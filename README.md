# esm-import-transformer

Can transform any ESM source code `import` URLs using an import maps object. Works in ES modules or in CJS.

```js
// Before
import {html, css, LitElement} from "lit";

// After
import {html, css, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
```

## Usage

Pass in a source code string and an [import maps](https://github.com/WICG/import-maps) object.

```js
import { ImportTransformer } from "esm-import-transformer";

// or CJS:
// const { ImportTransformer } = require("esm-import-transformer");

let it = new ImportTransformer();

// it.transform(sourceCode, importMapObject)
let inputCode = `import {html, css, LitElement} from "lit";`;

let outputCode = it.transform(sourceCode, {
  imports: {
    lit: "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"
  }
});
```