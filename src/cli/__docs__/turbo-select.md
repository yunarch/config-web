# turbo-select

```
Usage: turbo-select [options]

A CLI tool to filter and select a single package from the Turborepo package list
and run a script command.
Additionally, allow to prompt environment mode (development, staging,
production), for example, when using Vite.

Options:
  --run <script>  The package script command to execute (e.g., --run=dev).
  --select-env    An environment mode (development, staging, production) If
                  using for example vite.
  -h, --help      display help for command

Example usage:

$ turbo-select --run dev --select-env

```
