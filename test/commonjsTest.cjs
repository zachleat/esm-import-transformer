const test = require("ava");
const { ImportTransformer } = require("../import-transformer.cjs");

test("Full URL", t => {
  let tf = new ImportTransformer();

  let before = `import {html, css, LitElement} from "lit";`;
  let after = `import {html, css, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";`;

  t.is(tf.transform(before, {
    imports: {
      lit: "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"
    }
  }), after);
});