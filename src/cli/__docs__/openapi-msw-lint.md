# openapi-msw-lint

```
Usage: openapi-msw-lint [options]

CLI tool designed to lint and identify missing MSW (Mock Service Worker)
handlers based on the OpenAPI generated services from `openapi-gen`. It analyzes
your codebase to find where service methods are used and suggests appropriate
handlers with detailed reporting.

Options:
  --gen <path>             The output folder from `openapi-gen` script. Where
                           the generated models and openapi schema and type
                           definitions are saved.
  --msw-setup-file <path>  Path to the MSW setup file (file that configures MSW
                           setupServer or setupWorker).
  -h, --help               display help for command

Example usage:
$ openapi-msw-lint --gen ./src/api/gen --msw-setup-file ./src/api/msw/node.ts

Note: If the MSW setup file is a TypeScript file,
you must run the script with a runtime that supports TypeScript (e.g. tsx, ts-node, or bun).


```
