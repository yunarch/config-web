import { styleText } from 'node:util';
import type { ServiceInfo } from './findServicesUsages';
import type { MissingHandlerError } from './getMissingHandlers';

/**
 * Display results of the analysis in a formatted way.
 *
 * @param missingHandlers - The array of missing handler.
 */
export function displayResults(missingHandlers: MissingHandlerError[]) {
  // Group missing handlers by service
  const serviceGroups = new Map<
    string,
    { service: ServiceInfo; handlers: MissingHandlerError[] }
  >();
  for (const missingHandler of missingHandlers) {
    if (!serviceGroups.has(missingHandler.service.name)) {
      serviceGroups.set(missingHandler.service.name, {
        service: missingHandler.service,
        handlers: [],
      });
    }
    serviceGroups
      .get(missingHandler.service.name)
      ?.handlers.push(missingHandler);
  }
  // If no missing handlers, display a success message
  if (serviceGroups.size === 0) {
    console.log(styleText('green', '✔ No missing handlers found'));
    return;
  }
  // Display grouped missing handlers
  for (const { service, handlers } of serviceGroups.values()) {
    // Display service name and path (using relative path for better readability)
    console.log(
      `${styleText('underline', service.name)}${styleText('gray', ` (${service.path})`)}`
    );
    // Display each missing handler for this service
    for (const [handlerIndex, handler] of handlers.entries()) {
      const isLastHandler = handlerIndex === handlers.length - 1;
      // Display HTTP method and URL
      console.log(
        `  ${isLastHandler ? '└─' : '├─'} ${styleText('cyan', handler.service.toHandleHttpMethod)} ${styleText('yellow', handler.service.toHandleUrl)}`
      );
      // Display files where the handler is used
      console.log(
        `  ${isLastHandler ? ' ' : '│'}  ├─ ${styleText('gray', 'Used in:')}`
      );
      for (const [fileIndex, file] of handler.usedIn.entries()) {
        const isLastFile = fileIndex === handler.usedIn.length - 1;
        console.log(
          `  ${isLastHandler ? ' ' : '│'}  ${isLastFile ? '│   └─' : '│   ├─'} ${file}`
        );
      }
      // Display suggested handler path
      console.log(
        `  ${isLastHandler ? ' ' : '│'}  └─ ${styleText('green', 'Suggested handler:')}`
      );
      console.log(
        `  ${isLastHandler ? ' ' : '│'}      ${styleText('dim', '→')} ${handler.suggestedPath}`
      );
      // Add spacing between handlers
      if (handlerIndex < handlers.length - 1) {
        console.log(`  ${isLastHandler ? ' ' : '│'}`);
      }
    }
    // Empty line between services
    console.log('');
  }
  // Summary at the end
  console.log(
    styleText(
      'red',
      `✘ ${missingHandlers.length} missing ${missingHandlers.length === 1 ? 'handler' : 'handlers'}`
    )
  );
}
