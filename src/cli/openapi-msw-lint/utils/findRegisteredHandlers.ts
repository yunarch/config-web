import { pathToFileURL } from 'node:url';

// Types
export type RegisteredHandler = {
  httpMethod: string;
  url: string;
};

/**
 * Find all registered MSW handlers by dynamically importing the MSW setup file
 * and calling `listHandlers()` on the exported setup instance.
 *
 * Automatically detects the export that has a `listHandlers()` method.
 *
 * @param mswSetupFilePath - Path to the MSW setup file.
 * @returns An array of registered MSW handlers.
 *
 * @throws {Error} if no export with `listHandlers()` is found in the setup file.
 */
export async function findRegisteredHandlers(
  mswSetupFilePath: string
): Promise<RegisteredHandler[]> {
  const result: RegisteredHandler[] = [];
  const setupModule = (await import(
    pathToFileURL(mswSetupFilePath).href
  )) as Record<string, unknown>;
  // Auto-detect the export that has a listHandlers() method
  let mswInit:
    | {
        listHandlers: () => {
          info?: {
            header?: string;
            method: string;
            path?: string | ((...args: unknown[]) => unknown);
            callFrame?: string;
          };
        }[];
      }
    | undefined;
  for (const value of Object.values(setupModule)) {
    if (
      value &&
      typeof value === 'object' &&
      'listHandlers' in value &&
      typeof (value as Record<string, unknown>).listHandlers === 'function'
    ) {
      mswInit = value as typeof mswInit;
      break;
    }
  }
  if (!mswInit) {
    throw new Error(
      'No export with a listHandlers() method found in the MSW setup file. Ensure the file exports a setupServer() or setupWorker() instance.'
    );
  }
  const handlers = mswInit.listHandlers();
  for (const handler of handlers) {
    if (!('info' in handler)) continue; // Skip handlers without info
    if (!handler.info?.path || !handler.info.method) continue; // Skip handlers without path or method
    if (typeof handler.info.path !== 'string') continue; // Skip handlers with non-string paths (WebSocket handlers, custom predicates)
    const path = handler.info.path;
    const httpMethod = handler.info.method.toUpperCase();
    const url = path.replaceAll(/:(?<temp1>[^/]+)/g, '{$1}');
    result.push({
      httpMethod,
      url,
    });
  }
  return result;
}
