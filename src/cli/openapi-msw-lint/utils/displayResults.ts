import { styleText } from 'node:util';
import type { ServiceInfo } from './findServicesUsages';
import type { DisconnectedHandlerWarning } from './getDisconnectedHandlers';
import type { MissingHandlerError } from './getMissingHandlers';

/**
 * Display results of the analysis in a formatted way.
 *
 * @param missingHandlers - The array of missing handlers.
 * @param disconnectedHandlers - The array of disconnected handler warnings.
 */
export function displayResults(
  missingHandlers: MissingHandlerError[],
  disconnectedHandlers: DisconnectedHandlerWarning[] = []
) {
  // Display missing handlers
  const missingHandlersGroupByService = new Map<
    string,
    { service: ServiceInfo; handlers: MissingHandlerError[] }
  >();
  for (const missingHandler of missingHandlers) {
    if (!missingHandlersGroupByService.has(missingHandler.service.name)) {
      missingHandlersGroupByService.set(missingHandler.service.name, {
        service: missingHandler.service,
        handlers: [],
      });
    }
    missingHandlersGroupByService
      .get(missingHandler.service.name)
      ?.handlers.push(missingHandler);
  }
  if (missingHandlersGroupByService.size > 0) {
    console.log(
      styleText('red', `✖ Missing handlers (${missingHandlers.length})`)
    );
    for (const {
      service,
      handlers,
    } of missingHandlersGroupByService.values()) {
      console.log(
        `  ${styleText('underline', service.name)}${styleText('gray', ` (${service.path})`)}`
      );
      for (const [handlerIndex, handler] of handlers.entries()) {
        const isLast = handlerIndex === handlers.length - 1;
        console.log(
          `  ${isLast ? '└─' : '├─'} ${styleText('cyan', handler.service.toHandleHttpMethod)} ${styleText('yellow', handler.service.toHandleUrl)}`
        );
        console.log(
          `  ${isLast ? ' ' : '│'}  ├─ ${styleText('gray', 'Used in:')}`
        );
        for (const [fileIndex, file] of handler.usedIn.entries()) {
          const isLastFile = fileIndex === handler.usedIn.length - 1;
          console.log(
            `  ${isLast ? ' ' : '│'}  ${isLastFile ? '│   └─' : '│   ├─'} ${file}`
          );
        }
        console.log(`  ${isLast ? ' ' : '│'}  └─ Suggested handler:`);
        console.log(
          `  ${isLast ? ' ' : '│'}      ${styleText('dim', '→')} ${handler.suggestedPath}`
        );
        if (handlerIndex < handlers.length - 1) {
          console.log(`  ${isLast ? ' ' : '│'}`);
        }
      }
      console.log('');
    }
  }
  // Display disconnected handlers
  const disconnectedHandlersGroupByUrl = new Map<
    string,
    DisconnectedHandlerWarning[]
  >();
  for (const disconnectedHandler of disconnectedHandlers) {
    const handleKey = `${disconnectedHandler.handler.httpMethod}:${disconnectedHandler.handler.url}`;
    if (!disconnectedHandlersGroupByUrl.has(handleKey)) {
      disconnectedHandlersGroupByUrl.set(handleKey, []);
    }
    disconnectedHandlersGroupByUrl.get(handleKey)?.push(disconnectedHandler);
  }
  if (disconnectedHandlersGroupByUrl.size > 0) {
    console.log(
      styleText(
        'yellow',
        `⚠ Disconnected handlers (${disconnectedHandlers.length})`
      ),
      styleText('gray', '- Handler exists but is not registered in MSW setup')
    );
    for (const [hKey, handlers] of disconnectedHandlersGroupByUrl.entries()) {
      console.log(`  ${styleText('underline', hKey)}`);
      for (const [handlerIndex, { handler }] of handlers.entries()) {
        const isLast = handlerIndex === handlers.length - 1;
        console.log(
          `  ${isLast ? '└─' : '├─'} ${styleText('gray', 'Found in:')} ${styleText('dim', handler.filePath)}`
        );
      }
      console.log('');
    }
  }
  // Summary
  const parts: string[] = [];
  if (missingHandlers.length > 0) {
    parts.push(
      `${missingHandlers.length} missing ${missingHandlers.length === 1 ? 'handler' : 'handlers'}`
    );
  }
  if (disconnectedHandlers.length > 0) {
    parts.push(
      `${disconnectedHandlers.length} disconnected ${disconnectedHandlers.length === 1 ? 'handler' : 'handlers'}`
    );
  }
  if (parts.length > 0) {
    console.log(
      styleText(
        missingHandlers.length > 0 ? 'red' : 'yellow',
        `Found ${parts.join(', ')}`
      )
    );
  } else {
    console.log(styleText('green', '✔ No missing handlers found'));
  }
}
