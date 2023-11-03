import * as acorn from "acorn";

export class ImportTransformer {
  transformImportSource(str, sourceNode, indexOffset = 0, importMap = {}) {
    let { start, end, value } = sourceNode;
    // Could be improved by https://www.npmjs.com/package/@import-maps/resolve
    let resolved = importMap?.imports && importMap?.imports[value];
    if(resolved) {
      return {
        code: str.slice(0, start + 1 + indexOffset) + resolved + str.slice(end - 1 + indexOffset),
        offset: resolved.length - value.length,
      };
    }
    return {
      code: str,
      offset: 0
    };
  }

  transformImportCode(str, node, specifiers, sourceNode, indexOffset = 0) {
    let { start, end } = node;
    start += indexOffset;
    end += indexOffset;

    let { raw: rawSourceValue } = sourceNode;

    let importDeclaration = str.slice(start, end - 1);

    let specifierIndexes = [];
    if(importDeclaration.startsWith("import ")) {
      specifierIndexes[0] = "import ".length + start;
    } else {
      throw new Error(`Could not find \`import\` in import declaration: ${importDeclaration}`);
    }

    specifierIndexes[1] = specifiers[specifiers.length - 1].end + indexOffset;

    // normalize away trailing } on import { a, b, c } specifiers
    let split = str.slice(specifierIndexes[1]).split(" from ");
    if(split.length > 0) {
      specifierIndexes[1] += split[0].length;
    }

    let newImportString = `const ${str.slice(specifierIndexes[0], specifierIndexes[1])} = await import(${rawSourceValue})`;
    let returnedCode = str.slice(0, start) + newImportString + str.slice(end - 1);

    return {
      code: returnedCode,
      offset: returnedCode.length - str.length,
    };
  }

  transformToDynamicImport(input) {
    let ast = acorn.parse(input, {
      sourceType: "module",
      ecmaVersion: "latest"
    });

    let indexOffset = 0;
    for(let node of ast.body) {
      if(node.type === "ImportDeclaration") {
        let ret = this.transformImportCode(input, node, node.specifiers, node.source, indexOffset)
        input = ret.code;
        indexOffset += ret.offset;
      }
    }

    return input;
  }

  // alias for backwards compat
  transform(...args) {
    return this.transformWithImportMap(...args);
  }

  transformWithImportMap(input, importMap) {
    if(!importMap) {
      return input;
    }

    let ast = acorn.parse(input, {
      sourceType: "module",
      ecmaVersion: "latest"
    });

    let indexOffset = 0;
    for(let node of ast.body) {
      if(node.type === "ImportDeclaration") {
        if(importMap?.imports) {
          let ret = this.transformImportSource(input, node.source, indexOffset, importMap);
          input = ret.code;
          indexOffset += ret.offset;
        }
      }
    }

    return input;
  }
}
