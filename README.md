# esm-import-transformer

Can transform any ESM source code `import` URLs using an import maps object. This package works in ES modules or in CJS.

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

let sourceCode = `import {html, css, LitElement} from "lit";`;
let importMap = {
  imports: {
    lit: "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"
  }
};

let outputCode = it.transform(sourceCode, importMap);
```

## Installation

Available on [npm](https://www.npmjs.com/package/esm-import-transformer)

```
npm install esm-import-transformer
```
