// Types
export type ExistingHandlersMap = Map<
  string, // handler header key [httpMethod]:[handleUrl] (e.g., "GET:/api/users")
  {
    path: string;
    httpMethod: string;
    url: string;
  }
>;

/**
 * Find all existing MSW handlers.
 *
 * @param setupParams - The setup parameters containing the MSW setup file path and constant name.
 * @returns A map of existing MSW handlers keyed by their route pattern.
 *
 * @throws {TypeError} if the MSW setup constant is not found or does not have the expected methods or properties.
 */
export async function findExistingHandlers({
  mswSetupFilePath,
  mswSetupConst,
}: {
  mswSetupFilePath: string;
  mswSetupConst: string;
}): Promise<ExistingHandlersMap> {
  const result: ExistingHandlersMap = new Map();
  const setupModule = (await import(mswSetupFilePath)) as Record<
    string,
    unknown
  >;
  if (!Object.hasOwn(setupModule as object, mswSetupConst)) {
    throw new TypeError('MSW setup constant not found in the setup file');
  }
  const mswInit = setupModule[mswSetupConst] as
    | {
        listHandlers?: () => { info?: { method?: string; path?: string } }[];
      }
    | undefined;
  if (!mswInit || typeof mswInit.listHandlers !== 'function') {
    throw new TypeError(
      'MSW setup constant does not have a listHandlers() method'
    );
  }
  const handlers = mswInit.listHandlers();
  for (const handler of handlers) {
    if (!('info' in handler)) continue; // Skip handlers without info (e.g. WebSocketHandlers do not have info)
    if (!handler.info?.path || !handler.info.method) continue; // Skip handlers without path or method
    const path = String(handler.info.path);
    const httpMethod = String(handler.info.method).toUpperCase();
    const url = path.replaceAll(/:(?<temp1>[^/]+)/g, '{$1}');
    const handlerKey = `${httpMethod}:${url}`;
    result.set(handlerKey, {
      path,
      httpMethod,
      url,
    });
  }

  return result;
}
