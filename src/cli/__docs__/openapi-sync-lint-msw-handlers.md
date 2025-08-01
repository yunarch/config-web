# openapi-sync-lint-msw-handlers

```
Usage: openapi-sync-lint-msw-handlers [options]

Lint MSW handlers against OpenAPI generated services from `openapi-sync`.
It checks for missing handlers based on generated services and your MSW setup.

Options:
  --gen <path>               The output folder from `openapi-sync` script. Where
                             the generated models and openapi schema and type
                             definitions are saved.
  --msw-setup-file <path>    Path to the MSW setup file (file that configures
                             MSW setupServer or setupWorker).
  --msw-setup-const <const>  Name of the constant that holds the MSW setup
                             (e.g., server or worker).
  -h, --help                 display help for command

Example usage:

$ openapi-sync-lint-msw-handlers --gen ./src/api/gen --msw-setup-file ./src/api/__tests__/node.ts --msw-setup-const server

```
