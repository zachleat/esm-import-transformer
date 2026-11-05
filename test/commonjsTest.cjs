const test = require("node:test");
const assert = require("node:assert/strict");

test("Full URL", async () => {
  const { ImportTransformer } = await import("../import-transformer.js");

  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `import {html, css, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";`;

  assert.equal(tf.transformWithImportMap({
    imports: {
      lit: "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"
    }
  }), after);
});