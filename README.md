<div>
  <h1><a href="https://npm.im/@yunarch/config-web">@yunarch/config-web</a></h1>
</div>

> A curated set of linters (ESLint, Oxlint, Biome), formatters (Biome, Prettier), TypeScript configurations for web projects, and useful CLI tools.

With `@yunarch/config-web`, you get a well-balanced setup for your web projects, eliminating the hassle of manual configuration. These configurations serve as a strong foundation that you can extend and customize as needed.

- [Why use this?](#why-use-this)
- [What’s included?](#whats-included)
- [Installation](#installation)
- [Code Formatting](#code-formatting)
  - [Prettier](#prettier)
  - [Biome](#biome)
- [Linting](#linting)
- [Typescript](#typescript)
- [CLI Tools](#cli-tools)
  - [`swagger-sync`](#swagger-sync)
  - [`turbo-select`](#turbo-select)

## Why use this?

Even experienced developers can waste valuable time configuring tools from scratch. Instead of manually setting up linters, formatters, and TypeScript settings, this package provides a ready-to-use configuration that is both easy to implement and extensible. It helps maintain clean, consistent code without the overhead of ongoing tools configuration maintenance.

## What’s included?

This package provides ready-to-use configurations for:

- **Code Formatting:** Prettier, Biome
- **Linting:** ESLint, Oxlint, Biome
- **TypeScript:** Best-practice defaults
- **CLI Tools:** Useful command-line tools for streamlining workflows

> [!Tip]
> You can use these configurations as-is or extend them to suit your project's specific needs.

## Installation

1. To get started, install the package as a development dependency:

```
npm install ---save-dev @yunarch/config-web
```

2. Then, install the necessary dependencies for the tools you want to use:

```
// To use Prettier
npm install --save-dev prettier

// To use Biome
npm install --save-dev @biomejs/biome

// To use eslint
npm install --save-dev eslint

// To use Oxlint
npm install --save-dev oxlint
```

## Code Formatting

This package comes with configurations for both `Prettier` and `Biome` to ensure consistent formatting across your codebase.

> [!NOTE]
> While both `Prettier` and `Biome` are configured to format code in the same way, there are some [differences](https://biomejs.dev/formatter/differences-with-prettier/) between the two.

### Prettier

The easiest way to use the prettier configuration as-is is to set it directly in your `package.json`:

```json
"prettier": "@yunarch/config-web/formatter-prettier"
```

Or you can create a [configuration file](https://prettier.io/docs/configuration) to also allow further customization:

```js
import defaultConfig from "@yunarch/config-web/formatter-prettier";

/** @type {import("prettier").Options} */
export default {
  ...defaultConfig,
  // overrides here...
};
```

> [!WARNING]
> The Prettier configuration is only shipped as **ESM**. That means your `package.json` must include `"type": "module"`.

### Biome

To use the Biome formatter, create a `biome.json` [configuration file](https://biomejs.dev/reference/configuration/):

```jsonc
{
  "extends": ["@yunarch/config-web/formatter-biome"],
  // overrides here...
}
```

## Linting

TODO

## Typescript

Create the `tsconfig.json` file with the following content:

```jsonc
{
  "extends": "@yunarch/config-web/tsconfig-base",
  // overrides here...
}
```

Additionally, this package includes a `ts-reset` configuration to improve typescript built-in types. To use it, create a `reset.d.ts` file in your project with the following content:

```ts
import "@yunarch/config-web/reset.d.ts";
```

> [!NOTE]
> The `reset.d.ts` should be at the same level as the `tsconfig.json` file.

## CLI Tools

This package ships with useful command-line tools to streamline your workflow.

> [!Tip]
> All the CLI tools include a `--help` flag, which provides detailed information on usage and available options.

### `swagger-sync`

CLI tool designed to synchronize a local Swagger file with a remote API and generate API models. It helps keep your API documentation up to date with your actual API and automatically generates models based on the Swagger specification.

To use `swagger-sync`, you could, for example, have the following scripts on your `package.json`:

```json
"format:gen": "prettier --write ./gen ./swagger.json",
"sync-swagger": "swagger-sync --url=https://url/to/swagger.json --output=./swagger.json --models-folder=./gen --format-script=format:gen",
```

> [!NOTE]
> The optional `--format-script` argument allows you to automatically run a format script (e.g., format:gen) after the models are generated, but you can run any script of your choice here.

### `turbo-select`

CLI tool for filtering and selecting a single package from your Turborepo package list and executing a script command. Additionally, it can prompt you to select an environment mode (development, staging, production) — useful for adjusting settings based on the environment (e.g., when using Vite).

> [!WARNING]
> You must have [turborepo](https://turbo.build/repo/docs/getting-started) installed and configured in your project to use this tool.

To use `turbo-select`, you could, for example, have the following scripts on your `package.json`:

```json
"dev:select": "turbo-select --run=dev --select-env",
```
