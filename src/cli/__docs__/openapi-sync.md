# openapi-sync

```
Usage: openapi-sync [options]

A CLI tool to convert OpenAPI 3.0/3.1 schemas to TypeScript types and create
type-safe fetching based on a openapi file and keep them in sync.

Options:
  -i, --input <path>      The input (local or remote) openapi schema (JSON).
  -o, --output <folder>   The output folder to save the generated models and
                          openapi schema and type definitions.
  -f, --force-gen         Force generation of typescript schemas and fetching
                          code even if the input and output schemas are
                          identical.
  --include-msw-utils     Include MSW mocking utilities based on the generated
                          typescript types.
  --post-script <script>  A package.json script to run after the code
                          generation.
  -h, --help              display help for command

Example usage:

$ openapi-sync -i ./input.json -o ./src/api/gen --include-msw-utils

```
