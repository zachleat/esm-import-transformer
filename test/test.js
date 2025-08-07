import test from "ava";
import * as acorn from "acorn";
import { ImportTransformer } from "../import-transformer.js";

test("No import maps", t => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  t.is(tf.transformWithImportMap(), before);
});

test("Simple substitution", t => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `import {html, css, LitElement} from "other-lit-url";`;

  t.is(tf.transformWithImportMap({
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Simple substitution (backwards compat method)", t => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `import {html, css, LitElement} from "other-lit-url";`;

  t.is(tf.transform({
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Simple substitution (manual supply of ast)", t => {
  let before = `import {html, css, LitElement} from "lit";`;
  let ast = acorn.parse(before, {
    sourceType: "module",
    ecmaVersion: "latest"
  });
  let tf = new ImportTransformer(before, ast);

  let after = `import {html, css, LitElement} from "other-lit-url";`;

  t.is(tf.transformWithImportMap({
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Multiple substitutions", t => {
  let before = `
import all from "lit";
import all2 from "lit2";
import all3 from "lit";
`;
  let tf = new ImportTransformer(before);

  let after = `
import all from "other-lit-url";
import all2 from "other-lit-url2";
import all3 from "other-lit-url";
`;

  t.is(tf.transformWithImportMap({
    imports: {
      lit: "other-lit-url",
      lit2: "other-lit-url2"
    }
  }), after);
});

test("Full URL", t => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `import {html, css, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";`;

  t.is(tf.transformWithImportMap({
    imports: {
      lit: "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"
    }
  }), after);
});

test("Change to dynamic import (default)", t => {
  let before = `import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const noop = await import("@zachleat/noop");`;

  t.is(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import (destructured)", t => {
  let before = `import { html, css, LitElement } from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = await import("lit");`;

  t.is(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import (multiple)", t => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = await import("lit");
const noop = await import("@zachleat/noop");`;

  t.is(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import (multiple ×3)", t => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";
import noop2 from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = await import("lit");
const noop = await import("@zachleat/noop");
const noop2 = await import("@zachleat/noop");`;

  t.is(tf.transformToDynamicImport(), after);
});

// TODO
test.skip("Change to dynamic import, multiple types", t => {
  let before = `import myDefault, { myModule } from "/modules/my-module.js";`;
  let tf = new ImportTransformer(before);

  let after = `const myDefault = await import("my-module.js");const { myModule } = myDefault;`;

  t.is(tf.transformToDynamicImport(), after);
});

// TODO
test.skip("Change to dynamic import with alias", t => {
  let before = `import { reallyReallyLongModuleExportName as shortName } from "my-module.js";`;
  let tf = new ImportTransformer(before);

  let after = `const { reallyReallyLongModuleExportName: shortName } = await import("my-module.js");`;

  t.is(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import with namespace", t => {
  let before = `import * as name from "my-module.js";`;
  let tf = new ImportTransformer(before);

  let after = `const name = await import("my-module.js");`;

  t.is(tf.transformToDynamicImport(), after);
});

test("Change to require (default)", t => {
  let before = `import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const noop = require("@zachleat/noop");`;

  t.is(tf.transformToRequire(), after);
});


test("Change to require (destructured)", t => {
  let before = `import { html, css, LitElement } from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = require("lit");`;

  t.is(tf.transformToRequire(), after);
});

test("Change to require (multiple)", t => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = require("lit");
const noop = require("@zachleat/noop");`;

  t.is(tf.transformToRequire(), after);
});

test("Change to require (multiple ×3)", t => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";
import noop2 from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = require("lit");
const noop = require("@zachleat/noop");
const noop2 = require("@zachleat/noop");`;

  t.is(tf.transformToRequire(), after);
});

test("Test if has imports (using import)", t => {
  let code = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(code);

  t.is(tf.hasImports(), true);
});

test("Test if has imports (using require)", t => {
  let code = `const {html, css, LitElement} = require("lit");`;
  let tf = new ImportTransformer(code);

  t.is(tf.hasImports(), false);
});

test("Change to require (default, translated)", t => {
  let before = `import * as fetch from "@11ty/eleventy-fetch";`;
  let tf = new ImportTransformer(before);

  let after = `const fetch = require("@11ty/eleventy-fetch");`;

  t.is(tf.transformToRequire(), after);
});

test("Change to require (sass default, translated)", t => {
  let before = `import * as sass from "sass"`;
  let tf = new ImportTransformer(before);

  let after = `const sass = require("sass")`;

  t.is(tf.transformToRequire(), after);
});

test("Change to require extra semis (sass default, translated)", t => {
  let before = `import * as sass from "sass";;;    `;
  let tf = new ImportTransformer(before);

  let after = `const sass = require("sass");;;    `;

  t.is(tf.transformToRequire(), after);
});

test("Strip imports and exports", t => {
  let code = `/*before */import {html, css, LitElement} from "lit";/* middle */import somethingelse from "no";/* after */const b = 1;const c = 1;export const a = 1;/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/*before *//* import {html, css, LitElement} from "lit"; *//* middle *//* import somethingelse from "no"; *//* after */const b = 1;const c = 1;/* export */const a = 1;/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set([
    `import {html, css, LitElement} from "lit";`,
    `import somethingelse from "no";`,
  ]));
  t.deepEqual(exports, new Set([
    "export { a };",
  ]));
  t.deepEqual(namedExports, new Set(["a"]));
});

test("Strip imports and exports (sass default)", t => {
  let code = `/*before */import * as sass from "sass";/* after */const b = 1;export const c = 1;export const a = 1;/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/*before *//* import * as sass from "sass"; *//* after */const b = 1;/* export */const c = 1;/* export */const a = 1;/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set([
    `import * as sass from "sass";`,
  ]));
  t.deepEqual(exports, new Set([
    "export { c };",
    "export { a };",
  ]));
  t.deepEqual(namedExports, new Set(["c", "a"]));
});

test("Strip named exports", t => {
  let code = `/* start */const b = 1;const a = 1;export { b, a };/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/* start */const b = 1;const a = 1;/* export { b, a }; *//* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set());
  t.deepEqual(exports, new Set(["export { b, a };"]));
  t.deepEqual(namedExports, new Set(["b", "a"]));
});

test("Strip default exports", t => {
  let code = `/* start */const b = 1;const a = 1;export default b;/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/* start */const b = 1;const a = 1;/* export default b; *//* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set());
  t.deepEqual(exports, new Set(["export default b;"]));
  t.deepEqual(namedExports, new Set(["default"]));
});

test("Strip named export function", t => {
  let code = `/* start */export function testing() {}/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/* start *//* export */function testing() {}/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set());
  t.deepEqual(exports, new Set(["export { testing };"]));
  t.deepEqual(namedExports, new Set(["testing"]));
});

test("export default as", t => {
  let code = `/* start */export { default as name1 } from "module-name";/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/* start *//* export { default as name1 } from "module-name"; *//* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set());
  t.deepEqual(exports, new Set([
    `export { default as name1 } from "module-name";`
  ]));
  t.deepEqual(namedExports, new Set(["name1"]));
});

test("export lets", t => {
  let code = `/* start */export let name1, name2/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/* start *//* export */let name1, name2/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set());
  t.deepEqual(namedExports, new Set(["name1", "name2"]));
  t.deepEqual(exports, new Set([
    `export { name1, name2 };`,
  ]));
});

test("export const with values", t => {
  let code = `/* start */export const name1 = 1, name2 = 2/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/* start *//* export */const name1 = 1, name2 = 2/* end */`);

  let { imports, exports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set());
  t.deepEqual(exports, new Set([
    `export { name1, name2 };`,
  ]));
});

test("export const with values (destructuring reassignment)", t => {
  let code = `/* start */export const { name1, name2: bar } = o;/* end */`;
  let tf = new ImportTransformer(code);

  t.is(tf.transformRemoveImportExports(), `/* start *//* export */const { name1, name2: bar } = o;/* end */`);

  let { imports, exports } = tf.getImportsAndExports();
  t.deepEqual(imports, new Set());
  t.deepEqual(exports, new Set([
    `export { name1, name2 };`,
  ]));
});