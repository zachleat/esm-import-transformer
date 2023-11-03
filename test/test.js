import test from "ava";
import { ImportTransformer } from "../import-transformer.js";

test("No import maps", t => {
  let tf = new ImportTransformer();

  let before = `import {html, css, LitElement} from "lit";`;

  t.is(tf.transformWithImportMap(before), before);
});

test("Simple substitution", t => {
  let tf = new ImportTransformer();

  let before = `import {html, css, LitElement} from "lit";`;
  let after = `import {html, css, LitElement} from "other-lit-url";`;

  t.is(tf.transformWithImportMap(before, {
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Simple substitution (backwards compat method)", t => {
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

  t.is(tf.transformWithImportMap(before, {
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

  t.is(tf.transformWithImportMap(before, {
    imports: {
      lit: "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"
    }
  }), after);
});

test("Change to dynamic import (default)", t => {
  let tf = new ImportTransformer();

  let before = `import noop from "@zachleat/noop";`;
  let after = `const noop = await import("@zachleat/noop");`;

  t.is(tf.transformToDynamicImport(before), after);
});

test("Change to dynamic import (destructured)", t => {
  let tf = new ImportTransformer();

  let before = `import { html, css, LitElement } from "lit";`;
  let after = `const { html, css, LitElement } = await import("lit");`;

  t.is(tf.transformToDynamicImport(before), after);
});

test("Change to dynamic import (multiple)", t => {
  let tf = new ImportTransformer();

  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";`;

  let after = `const { html, css, LitElement } = await import("lit");
const noop = await import("@zachleat/noop");`;

  t.is(tf.transformToDynamicImport(before), after);
});

test("Change to dynamic import (multiple ×3)", t => {
  let tf = new ImportTransformer();

  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";
import noop2 from "@zachleat/noop";`;

  let after = `const { html, css, LitElement } = await import("lit");
const noop = await import("@zachleat/noop");
const noop2 = await import("@zachleat/noop");`;

  t.is(tf.transformToDynamicImport(before), after);
});

// TODO
test.skip("Change to dynamic import, multiple types", t => {
  let tf = new ImportTransformer();

  let before = `import myDefault, { myModule } from "/modules/my-module.js";`;
  let after = `const myDefault = await import("my-module.js");const { myModule } = myDefault;`;

  t.is(tf.transformToDynamicImport(before), after);
});

// TODO
test.skip("Change to dynamic import with alias", t => {
  let tf = new ImportTransformer();

  let before = `import { reallyReallyLongModuleExportName as shortName } from "my-module.js";`;
  let after = `const { reallyReallyLongModuleExportName: shortName } = await import("my-module.js");`;

  t.is(tf.transformToDynamicImport(before), after);
});

// TODO
test.skip("Change to dynamic import with namespace", t => {
  let tf = new ImportTransformer();

  let before = `import * as name from "my-module.js";`;
  let after = `/* TODO */`;

  t.is(tf.transformToDynamicImport(before), after);
});
