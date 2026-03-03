# openapi-msw-lint

```
Usage: openapi-msw-lint [options]

CLI tool designed to lint and identifying missing MSW (Mock Service Worker)
handlers based on the OpenAPI generated services from `openapi-gen`. It analyzes
your codebase to find where service methods are used and suggests appropriate
handlers with detailed reporting.

Options:
  --gen <path>               The output folder from `openapi-gen` script. Where
                             the generated models and openapi schema and type
                             definitions are saved.
  --msw-setup-file <path>    Path to the MSW setup file (file that configures
                             MSW setupServer or setupWorker).
  --msw-setup-const <const>  Name of the constant that holds the MSW setup
                             (e.g., server or worker).
  -h, --help                 display help for command

Example usage:
$ openapi-msw-lint --gen ./src/api/gen --msw-setup-file ./src/api/__tests__/node.js --msw-setup-const server

Note: If the MSW setup file (passed via --msw-setup-file) is a TypeScript file,
you must run the script with a runtime that supports TypeScript (e.g. tsx, ts-node, or bun).

Examples:
$ tsx ./node_modules/@yunarch/config-web/dist/cli/openapi-msw-lint/openapi-msw-lint.cli.js --gen ./src/api/gen --msw-setup-file ./src/api/__tests__/node.ts --msw-setup-const server

$ bun --bun openapi-msw-lint --gen ./src/api/gen --msw-setup-file ./src/api/__tests__/node.ts --msw-setup-const server


```
