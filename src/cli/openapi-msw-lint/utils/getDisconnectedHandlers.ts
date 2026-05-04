import type { ExistingHandler } from './findExistingHandlers';
import type { RegisteredHandler } from './findRegisteredHandlers';

// Types
export type DisconnectedHandlerWarning = {
  type: 'disconnected_handler';
  handler: ExistingHandler;
};

/**
 * Find handlers that exist as files (statically found) but are not registered
 * in the MSW setup at runtime.
 *
 * @param existingHandlers - The array of handlers found via static analysis.
 * @param registeredHandlers - The array of handlers registered in the MSW setup.
 * @returns An array of disconnected handler warnings.
 */
export function getDisconnectedHandlers(
  existingHandlers: ExistingHandler[],
  registeredHandlers: RegisteredHandler[]
): DisconnectedHandlerWarning[] {
  const result: DisconnectedHandlerWarning[] = [];
  for (const handler of existingHandlers) {
    // Skip runtime overrides (handlers inside .use() calls)
    if (handler.isRuntimeOverride) continue;
    if (
      !registeredHandlers.some(
        (registeredHandler) =>
          registeredHandler.httpMethod === handler.httpMethod &&
          registeredHandler.url === handler.url
      ) &&
      !registeredHandlers.some(
        (registeredHandler) =>
          registeredHandler.httpMethod === handler.httpMethod &&
          registeredHandler.url === `*${handler.url}`
      )
    ) {
      result.push({
        type: 'disconnected_handler',
        handler,
      });
    }
  }
  return result;
}
