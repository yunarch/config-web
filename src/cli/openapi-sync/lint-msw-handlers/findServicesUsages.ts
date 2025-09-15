import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import ts from 'typescript';

// Types
export type ServiceInfo = {
  path: string;
  name: string;
  methodName: string;
  toHandleUrl: string;
  toHandleHttpMethod: string;
};
export type ServicesUsagesMap = Map<
  string, // service name
  Map<
    string, // method name
    {
      serviceInfo: ServiceInfo;
      files: Set<string>; // files where the service method is used
    }
  >
>;

/**
 * Extract service methods from the generated API files.
 *
 * @param genPath - The path to the generated API files.
 * @returns An array of service methods found in the generated API files.
 *
 * @throws {Error} if the services directory is not found.
 */
async function extractGenApiServicesInfo(genPath: string) {
  const result: ServiceInfo[] = [];
  const servicesDir = path.join(genPath, 'services');
  if (!existsSync(servicesDir)) {
    throw new Error(`Services directory not found: ${servicesDir}`);
  }
  const serviceFiles = await fg('**/*Service.ts', {
    cwd: servicesDir,
    absolute: true,
    ignore: ['**/node_modules/**'],
  });
  for (const serviceFile of serviceFiles) {
    const name = path.basename(serviceFile, '.ts');
    const fileContent = readFileSync(serviceFile, 'utf8');
    const sourceFile = ts.createSourceFile(
      serviceFile,
      fileContent,
      ts.ScriptTarget.Latest,
      true
    );
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node) && node.name?.text === name) {
        for (const member of node.members) {
          if (
            ts.isMethodDeclaration(member) &&
            ts.isIdentifier(member.name) &&
            member.modifiers &&
            member.modifiers.some(
              (m) => m.kind === ts.SyntaxKind.PublicKeyword
            ) &&
            member.modifiers.some((m) => m.kind === ts.SyntaxKind.StaticKeyword)
          ) {
            const methodName = member.name.text;
            let toHandleUrl: string | undefined;
            let toHandleHttpMethod: string | undefined;
            const findRequestInfo = (n: ts.Node) => {
              if (
                ts.isReturnStatement(n) &&
                n.expression &&
                ts.isCallExpression(n.expression) &&
                ts.isIdentifier(n.expression.expression) &&
                n.expression.expression.text === '__request'
              ) {
                const optionsArg = n.expression.arguments[1];
                if (ts.isObjectLiteralExpression(optionsArg)) {
                  for (const prop of optionsArg.properties) {
                    if (
                      ts.isPropertyAssignment(prop) &&
                      ts.isIdentifier(prop.name) &&
                      prop.name.text === 'url' &&
                      ts.isStringLiteral(prop.initializer)
                    ) {
                      toHandleUrl = prop.initializer.text;
                    } else if (
                      ts.isPropertyAssignment(prop) &&
                      ts.isIdentifier(prop.name) &&
                      prop.name.text === 'method' &&
                      ts.isStringLiteral(prop.initializer)
                    ) {
                      toHandleHttpMethod = prop.initializer.text.toUpperCase();
                    }
                  }
                }
              }
              ts.forEachChild(n, findRequestInfo);
            };
            if (member.body) ts.forEachChild(member.body, findRequestInfo);
            if (toHandleUrl && toHandleHttpMethod) {
              result.push({
                path: serviceFile,
                name,
                methodName,
                toHandleUrl,
                toHandleHttpMethod,
              });
            } else {
              if (!toHandleUrl) {
                console.warn(
                  `No URL found for ${methodName} request in service ${name} (${serviceFile})`
                );
              }
              if (!toHandleHttpMethod) {
                console.warn(
                  `No HTTP method found for ${methodName} request in service ${name} (${serviceFile})`
                );
              }
            }
          }
        }
      }
    });
  }
  return result;
}

/**
 * Find all service method usages in the source code.
 *
 * @param params - The parameters containing the path to the generated API files and the source code directory.
 * @returns A map of service method usages found in the source code.
 *
 * @throws {Error} if there is an error parsing a source file.
 */
export async function findServicesUsages({
  genPath,
  srcPath,
}: {
  genPath: string;
  srcPath: string;
}): Promise<ServicesUsagesMap> {
  const services = await extractGenApiServicesInfo(genPath);
  const result: ServicesUsagesMap = new Map();
  for (const serviceInfo of services) {
    if (!result.has(serviceInfo.name)) {
      result.set(serviceInfo.name, new Map());
    }
    result.get(serviceInfo.name)?.set(serviceInfo.methodName, {
      serviceInfo,
      files: new Set(),
    });
  }
  // Find all TypeScript files in src, excluding gen and handlers directories
  const srcFiles = await fg('**/*.{ts,tsx}', {
    cwd: srcPath,
    absolute: true,
    ignore: ['**/node_modules/**', '**/__tests__/**'],
  });
  for (const file of srcFiles) {
    try {
      const fileContent = readFileSync(file, 'utf8');
      const sourceFile = ts.createSourceFile(
        file,
        fileContent,
        ts.ScriptTarget.Latest,
        true
      );
      const visit = (node: ts.Node) => {
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.expression) &&
          node.expression.expression.text.endsWith('Service')
        ) {
          const serviceName = node.expression.expression.text;
          const methodName = node.expression.name.text;
          const service = result.get(serviceName)?.get(methodName);
          if (!service) return;
          service.files.add(file);
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
    } catch (error) {
      const e =
        error instanceof Error
          ? new Error(`Error parsing ${file}: ${error.message}`)
          : new Error(`Error parsing ${file}: Unknown error`);
      throw e;
    }
  }
  // Clean up the result map to remove empty entries and return the map of service usages
  for (const [serviceName, methodsMap] of result.entries()) {
    for (const [methodName, serviceUsage] of methodsMap.entries()) {
      if (serviceUsage.files.size === 0) methodsMap.delete(methodName);
    }
    if (methodsMap.size === 0) result.delete(serviceName);
  }
  return result;
}
