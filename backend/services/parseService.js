const prs = require("@babel/parser");
const trvs = require("@babel/traverse").default || require("@babel/traverse");
const promse = require("fs/promises");

async function parseFile(filepath) {
  const functions = new Set();
  const calls = new Set();

  try {
    const content = await promse.readFile(filepath, { encoding: "utf8" });
    const ast = prs.parse(content, {
      sourceType: "unambiguous",
      plugins: ["jsx", "typescript"],
    });

    trvs(ast, {
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name) {
          functions.add(path.node.id.name);
        }
      },

      VariableDeclarator(path) {
        const isFunction =
          path.node.init &&
          (path.node.init.type === "ArrowFunctionExpression" ||
            path.node.init.type === "FunctionExpression");

        if (isFunction && path.node.id && path.node.id.name) {
          functions.add(path.node.id.name);
        }
      },
      AssignmentExpression(path) {
        const isFunction =
          path.node.right &&
          (path.node.right.type === "ArrowFunctionExpression" ||
            path.node.right.type === "FunctionExpression");

        if (isFunction) {
          const left = path.node.left;
          if (left.type === "MemberExpression" && left.property && left.property.name) {
            functions.add(left.property.name);
          }
          else if (left.type === "Identifier") {
            functions.add(left.name);
          }
        }
      },

      CallExpression(path) {
        const callee = path.node.callee;
        if (callee.type === "Identifier") {
          calls.add(callee.name);
        } else if (
          callee.type === "MemberExpression" &&
          callee.property &&
          callee.property.name
        ) {
          calls.add(callee.property.name);
        }
      },
    });

    const result = {
      filePath: filepath,
      functions: Array.from(functions),
      calls: Array.from(calls),
    };
    return result;
  } catch (error) {
    console.error(`Failed to parse file ${filepath}:`, error.message);
    return {
      filePath: filepath,
      functions: [],
      calls: [],
      error: error.message,
    };
  }
}

module.exports = { parseFile };