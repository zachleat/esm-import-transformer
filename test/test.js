import test from "node:test";
import assert from "node:assert/strict";
import * as acorn from "acorn";
import { ImportTransformer } from "../import-transformer.js";

test("No import maps", () => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  assert.equal(tf.transformWithImportMap(), before);
});

test("Simple substitution", () => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `import {html, css, LitElement} from "other-lit-url";`;

  assert.equal(tf.transformWithImportMap({
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Simple substitution (backwards compat method)", () => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `import {html, css, LitElement} from "other-lit-url";`;

  assert.equal(tf.transform({
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Simple substitution (manual supply of ast)", () => {
  let before = `import {html, css, LitElement} from "lit";`;
  let ast = acorn.parse(before, {
    sourceType: "module",
    ecmaVersion: "latest"
  });
  let tf = new ImportTransformer(before, ast);

  let after = `import {html, css, LitElement} from "other-lit-url";`;

  assert.equal(tf.transformWithImportMap({
    imports: {
      lit: "other-lit-url"
    }
  }), after);
});

test("Multiple substitutions", () => {
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

  assert.equal(tf.transformWithImportMap({
    imports: {
      lit: "other-lit-url",
      lit2: "other-lit-url2"
    }
  }), after);
});

test("Full URL", () => {
  let before = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `import {html, css, LitElement} from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";`;

  assert.equal(tf.transformWithImportMap({
    imports: {
      lit: "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js"
    }
  }), after);
});

test("Change to dynamic import (default)", () => {
  let before = `import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const noop = await import("@zachleat/noop");`;

  assert.equal(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import (destructured)", () => {
  let before = `import { html, css, LitElement } from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = await import("lit");`;

  assert.equal(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import (multiple)", () => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = await import("lit");
const noop = await import("@zachleat/noop");`;

  assert.equal(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import (multiple ×3)", () => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";
import noop2 from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = await import("lit");
const noop = await import("@zachleat/noop");
const noop2 = await import("@zachleat/noop");`;

  assert.equal(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import, multiple types", () => {
  let before = `import myDefault, { myModule } from "/modules/my-module.js";`;
  let tf = new ImportTransformer(before);

  let after = `const myDefault = await import("/modules/my-module.js");const { myModule } = myDefault;`;

  assert.equal(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import with alias", () => {
  let before = `import { reallyReallyLongModuleExportName as shortName } from "my-module.js";`;
  let tf = new ImportTransformer(before);

  let after = `const { reallyReallyLongModuleExportName: shortName } = await import("my-module.js");`;

  assert.equal(tf.transformToDynamicImport(), after);
});

test("Change to dynamic import with namespace", () => {
  let before = `import * as name from "my-module.js";`;
  let tf = new ImportTransformer(before);

  let after = `const name = await import("my-module.js");`;

  assert.equal(tf.transformToDynamicImport(), after);
});

test("Change to require (default)", () => {
  let before = `import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const noop = require("@zachleat/noop");`;

  assert.equal(tf.transformToRequire(), after);
});


test("Change to require (destructured)", () => {
  let before = `import { html, css, LitElement } from "lit";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = require("lit");`;

  assert.equal(tf.transformToRequire(), after);
});

test("Change to require (multiple)", () => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = require("lit");
const noop = require("@zachleat/noop");`;

  assert.equal(tf.transformToRequire(), after);
});

test("Change to require (multiple ×3)", () => {
  let before = `import { html, css, LitElement } from "lit";
import noop from "@zachleat/noop";
import noop2 from "@zachleat/noop";`;
  let tf = new ImportTransformer(before);

  let after = `const { html, css, LitElement } = require("lit");
const noop = require("@zachleat/noop");
const noop2 = require("@zachleat/noop");`;

  assert.equal(tf.transformToRequire(), after);
});

test("Test if has imports (using import)", () => {
  let code = `import {html, css, LitElement} from "lit";`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.hasImports(), true);
});

test("Test if has imports (using require)", () => {
  let code = `const {html, css, LitElement} = require("lit");`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.hasImports(), false);
});

test("Change to require (default, translated)", () => {
  let before = `import * as fetch from "@11ty/eleventy-fetch";`;
  let tf = new ImportTransformer(before);

  let after = `const fetch = require("@11ty/eleventy-fetch");`;

  assert.equal(tf.transformToRequire(), after);
});

test("Change to require (sass default, translated)", () => {
  let before = `import * as sass from "sass"`;
  let tf = new ImportTransformer(before);

  let after = `const sass = require("sass")`;

  assert.equal(tf.transformToRequire(), after);
});

test("Change to require extra semis (sass default, translated)", () => {
  let before = `import * as sass from "sass";;;    `;
  let tf = new ImportTransformer(before);

  let after = `const sass = require("sass");;;    `;

  assert.equal(tf.transformToRequire(), after);
});

test("Strip imports and exports", () => {
  let code = `/*before */import {html, css, LitElement} from "lit";/* middle */import somethingelse from "no";/* after */const b = 1;const c = 1;export const a = 1;/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/*before *//* import {html, css, LitElement} from "lit"; *//* middle *//* import somethingelse from "no"; *//* after */const b = 1;const c = 1;/* export */const a = 1;/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set([
    `import {html, css, LitElement} from "lit";`,
    `import somethingelse from "no";`,
  ]));
  assert.deepEqual(exports, new Set([
    "export { a };",
  ]));
  assert.deepEqual(namedExports, new Set(["a"]));
});

test("Strip imports and exports (sass default)", () => {
  let code = `/*before */import * as sass from "sass";/* after */const b = 1;export const c = 1;export const a = 1;/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/*before *//* import * as sass from "sass"; *//* after */const b = 1;/* export */const c = 1;/* export */const a = 1;/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set([
    `import * as sass from "sass";`,
  ]));
  assert.deepEqual(exports, new Set([
    "export { c };",
    "export { a };",
  ]));
  assert.deepEqual(namedExports, new Set(["c", "a"]));
});

test("Strip named exports", () => {
  let code = `/* start */const b = 1;const a = 1;export { b, a };/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* start */const b = 1;const a = 1;/* export { b, a }; *//* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set());
  assert.deepEqual(exports, new Set(["export { b, a };"]));
  assert.deepEqual(namedExports, new Set(["b", "a"]));
});

test("Strip default exports", () => {
  let code = `/* start */const b = 1;const a = 1;export default b;/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* start */const b = 1;const a = 1;/* export default b; *//* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set());
  assert.deepEqual(exports, new Set(["export default b;"]));
  assert.deepEqual(namedExports, new Set(["default"]));
});

test("Strip named export function", () => {
  let code = `/* start */export function testing() {}/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* start *//* export */function testing() {}/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set());
  assert.deepEqual(exports, new Set(["export { testing };"]));
  assert.deepEqual(namedExports, new Set(["testing"]));
});

test("export default as", () => {
  let code = `/* start */export { default as name1 } from "module-name";/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* start *//* export { default as name1 } from "module-name"; *//* end */`);

  let { imports, exports, namedExports, exportBindings } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set([
    `import { default as name1 } from "module-name";`
  ]));
  assert.deepEqual(exports, new Set([
    `export { default as name1 } from "module-name";`
  ]));
  assert.deepEqual(namedExports, new Set(["name1"]));
  assert.deepEqual(exportBindings, new Map([["name1", "name1"]]));
});

test("export alias", () => {
  let code = `const a = 1;export { a as b, a };`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `const a = 1;/* export { a as b, a }; */`);

  let { namedExports, exportBindings } = tf.getImportsAndExports();
  assert.deepEqual(namedExports, new Set(["b", "a"]));
  assert.deepEqual(exportBindings, new Map([["b", "a"], ["a", "a"]]));
});

test("export namespace from", () => {
  let code = `export * as ns from "module-name";`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* export * as ns from "module-name"; */`);

  let { imports, namedExports, exportBindings } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set([`import * as ns from "module-name";`]));
  assert.deepEqual(namedExports, new Set(["ns"]));
  assert.deepEqual(exportBindings, new Map([["ns", "ns"]]));
});

test("export star from", () => {
  let code = `export * from "a";export * from "b";`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* export * from "a"; *//* export * from "b"; */`);

  let { imports, namedExports, exportStars } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set([
    `import * as __exportStar0 from "a";`,
    `import * as __exportStar1 from "b";`,
  ]));
  assert.deepEqual(namedExports, new Set());
  assert.deepEqual(exportStars, new Set(["__exportStar0", "__exportStar1"]));
});

test("Import map applies to export from", () => {
  let tf = new ImportTransformer(`export { a } from "module-name";export * from "module-name";`);

  assert.equal(tf.transformWithImportMap({
    imports: {
      "module-name": "./mapped.js"
    }
  }), `export { a } from "./mapped.js";export * from "./mapped.js";`);
});

test("export lets", () => {
  let code = `/* start */export let name1, name2/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* start *//* export */let name1, name2/* end */`);

  let { imports, exports, namedExports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set());
  assert.deepEqual(namedExports, new Set(["name1", "name2"]));
  assert.deepEqual(exports, new Set([
    `export { name1, name2 };`,
  ]));
});

test("export const with values", () => {
  let code = `/* start */export const name1 = 1, name2 = 2/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* start *//* export */const name1 = 1, name2 = 2/* end */`);

  let { imports, exports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set());
  assert.deepEqual(exports, new Set([
    `export { name1, name2 };`,
  ]));
});

test("export const with values (destructuring reassignment)", () => {
  let code = `/* start */export const { name1, name2: bar } = o;/* end */`;
  let tf = new ImportTransformer(code);

  assert.equal(tf.transformRemoveImportExports(), `/* start *//* export */const { name1, name2: bar } = o;/* end */`);

  let { imports, exports } = tf.getImportsAndExports();
  assert.deepEqual(imports, new Set());
  assert.deepEqual(exports, new Set([
    `export { name1, name2 };`,
  ]));
});