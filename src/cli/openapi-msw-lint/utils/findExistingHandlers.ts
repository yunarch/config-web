import { readFileSync } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import ts from 'typescript';

const HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
]);

// Types
export type ExistingHandler = {
  httpMethod: string;
  url: string;
  filePath: string;
  isRuntimeOverride: boolean;
};

/**
 * Check if a module specifier resolves to the generated `openapi-msw-http` module.
 *
 * @param moduleSpecifier - The import module specifier string.
 * @param importingFile - The absolute path of the file containing the import.
 * @param genPath - The path to the generated API output directory.
 * @returns `true` if the specifier resolves to the generated openapi-msw-http module.
 */
function isOpenapiMswHttpImport(
  moduleSpecifier: string,
  importingFile: string,
  genPath: string
): boolean {
  // Handle relative imports
  if (moduleSpecifier.startsWith('.')) {
    const resolved = path.resolve(path.dirname(importingFile), moduleSpecifier);
    const normalizedGen = path.resolve(genPath);
    const expectedPath = path.join(normalizedGen, 'openapi-msw-http');
    // Strip known file extensions from resolved path for comparison
    const normalizedResolved = resolved.replace(
      /\.(?:ts|tsx|js|jsx|mjs|cjs)$/,
      ''
    );
    return normalizedResolved === expectedPath || resolved === expectedPath;
  }
  // Handle bare/alias imports that end with openapi-msw-http
  return moduleSpecifier.endsWith('openapi-msw-http');
}

/**
 * Check if a node is inside a .use() call (e.g. server.use(http.get(...)))
 * This is used to identify runtime override handlers that should be ignored in the disconnected handlers check.
 *
 * @param node - The TypeScript AST node to check.
 * @returns `true` if the node is inside a .use() call, otherwise `false`.
 */
function isInsideUseCall(node: ts.Node): boolean {
  if (
    ts.isCallExpression(node.parent) &&
    ts.isPropertyAccessExpression(node.parent.expression) &&
    ts.isIdentifier(node.parent.expression.name) &&
    node.parent.expression.name.text === 'use'
  ) {
    return true;
  }
  return false;
}

/**
 * Find all existing MSW handlers by statically scanning for files that use:
 * 1. `http(path, method, resolver)` from the generated `openapi-msw-http` module
 * 2. `http.get(path, resolver)`, `http.post(...)`, etc. from native `msw`
 *
 * @param options - Options for finding existing handlers.
 * @returns A map of existing MSW handlers keyed by their route pattern.
 */
export async function findExistingHandlers({
  srcPath,
  genPath,
}: {
  srcPath: string;
  genPath: string;
}): Promise<ExistingHandler[]> {
  const result: ExistingHandler[] = [];
  const files = await fg('**/*.{ts,tsx,js,jsx,mjs,cjs}', {
    cwd: srcPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  });
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    // Quick check: skip files that don't mention msw or openapi-msw-http at all
    if (!content.includes('msw')) continue;
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );
    // Track import names for both sources
    let openapiHttpImportName: string | undefined;
    let nativeMswHttpImportName: string | undefined;
    ts.forEachChild(sourceFile, (node) => {
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        const moduleSpecifier = node.moduleSpecifier.text;
        // Check for openapi-msw-http import
        if (
          isOpenapiMswHttpImport(moduleSpecifier, file, genPath) &&
          node.importClause?.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings)
        ) {
          for (const element of node.importClause.namedBindings.elements) {
            const originalName = (element.propertyName ?? element.name).text;
            if (originalName === 'http') {
              openapiHttpImportName = element.name.text;
            }
          }
        }
        // Check for native msw import
        if (
          moduleSpecifier === 'msw' &&
          node.importClause?.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings)
        ) {
          for (const element of node.importClause.namedBindings.elements) {
            const originalName = (element.propertyName ?? element.name).text;
            if (originalName === 'http') {
              nativeMswHttpImportName = element.name.text;
            }
          }
        }
      }
    });
    if (!openapiHttpImportName && !nativeMswHttpImportName) continue;
    // Find handler call expressions
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        // Pattern 1: openapi-msw-http → http(path, method, resolver)
        if (
          openapiHttpImportName &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === openapiHttpImportName &&
          node.arguments.length >= 2
        ) {
          const pathArg = node.arguments[0];
          const methodArg = node.arguments[1];
          if (ts.isStringLiteral(pathArg) && ts.isStringLiteral(methodArg)) {
            const url = pathArg.text;
            const httpMethod = methodArg.text.toUpperCase();
            result.push({
              httpMethod,
              url,
              filePath: file,
              isRuntimeOverride: isInsideUseCall(node),
            });
          }
        }
        // Pattern 2: native msw → http.get(path, resolver), http.post(path, resolver), etc.
        if (
          nativeMswHttpImportName &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text === nativeMswHttpImportName &&
          ts.isIdentifier(node.expression.name) &&
          HTTP_METHODS.has(node.expression.name.text.toLowerCase()) &&
          node.arguments.length > 0
        ) {
          const pathArg = node.arguments[0];
          if (ts.isStringLiteral(pathArg)) {
            const httpMethod = node.expression.name.text.toUpperCase();
            // Native MSW uses :param syntax, convert to {param}
            const url = pathArg.text.replaceAll(/:(?<temp1>[^/]+)/g, '{$1}');
            result.push({
              httpMethod,
              url,
              filePath: file,
              isRuntimeOverride: isInsideUseCall(node),
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }
  return result;
}
