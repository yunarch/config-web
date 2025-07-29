import path from 'node:path';
import type { ExistingHandlersMap } from './findExistingHandlers';
import type { ServiceInfo, ServicesUsagesMap } from './findServicesUsages';

// Types
export type MissingHandlerError = {
  type: 'missing_handler';
  service: ServiceInfo;
  usedIn: string[]; // files where the service method is used
  suggestedPath: string; // Suggested path to create the handler
};

/**
 * @param servicesUsages - The map of services usages.
 * @param existingHandlers - The map of existing handlers.
 * @param suggestBasePath - The base path to suggest for missing handlers.
 * @returns An array of missing handlers.
 */
export function getMissingHandlers(
  servicesUsages: ServicesUsagesMap,
  existingHandlers: ExistingHandlersMap,
  suggestBasePath: string
) {
  const result: MissingHandlerError[] = [];
  for (const [serviceName, methods] of servicesUsages.entries()) {
    for (const [methodName, serviceUsage] of methods.entries()) {
      const { serviceInfo } = serviceUsage;
      const toHandleHttpMethod = serviceInfo.toHandleHttpMethod;
      const toHandleUrl = serviceInfo.toHandleUrl;
      if (
        !existingHandlers.has(`${toHandleHttpMethod}:${toHandleUrl}`) &&
        !existingHandlers.has(`${toHandleHttpMethod}:*${toHandleUrl}`)
      ) {
        result.push({
          type: 'missing_handler',
          service: serviceInfo,
          usedIn: [...serviceUsage.files],
          suggestedPath: path.join(
            suggestBasePath,
            `handlers/services/${serviceName}/${methodName}.ts`
          ),
        });
      }
    }
  }
  return result;
}
