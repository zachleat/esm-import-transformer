import test from "ava";
import { ImportTransformer } from "../import-transformer.js";

test("No import maps", t => {
  let tf = new ImportTransformer();

  let before = `import {html, css, LitElement} from "lit";`;

  t.is(tf.transform(before), before);
});

test("Simple substitution", t => {
  let tf = new ImportTransformer();

  let before = `import {html, css, LitElement} from "lit";`;
  let after = `import {html, css, LitElement} from "other-lit-url";`;

  t.is(tf.transform(before, {
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Multiple substitutions", t => {
  let tf = new ImportTransformer();

  let before = `
import all from "lit";
import all2 from "lit2";
import all3 from "lit";
`;
  let after = `
import all from "other-lit-url";
import all2 from "other-lit-url2";
import all3 from "other-lit-url";
`;

  t.is(tf.transform(before, {
    imports: {
      lit: "other-lit-url",
      lit2: "other-lit-url2"
    }
  }), after);
});

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