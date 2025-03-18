<h1><a href="https://npm.im/@yunarch/config-web">@yunarch/config-web</a></h1>

> A curated set of linters (ESLint, Oxlint, Biome), formatters (Biome, Prettier), TypeScript configurations for web projects, and useful CLI tools.

With `@yunarch/config-web`, you get a well-balanced setup for your web projects, eliminating the hassle of manual configuration. These configurations serve as a strong foundation that you can extend and customize as needed.

> [!NOTE]
> This package is pure [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). This means you need to ensure to use an **ESM-Compatible Environment** (Your runtime or bundler must support ESM) and enable **Package Type module** by adding the following to you `package.json`:
>
> ```json
> "type": "module"
> ```

- [📖 Why use this?](#-why-use-this)
- [📦 What’s included?](#-whats-included)
- [⚙️ Installation](#️-installation)
- [📐 Code Formatting](#-code-formatting)
  - [Prettier](#prettier)
  - [Biome](#biome)
- [🧹 Linting](#-linting)
- [🔵 Typescript](#-typescript)
- [🔧 CLI Tools](#-cli-tools)

## 📖 Why use this?

Even experienced developers can waste valuable time configuring tools from scratch. Instead of manually setting up linters, formatters, and TypeScript settings, this package provides a ready-to-use configuration that is both easy to implement and extensible. It helps maintain clean, consistent code without the overhead of ongoing tools configuration maintenance.

> [!IMPORTANT]
> Please keep in mind that this is still **a personal config** with a lot of opinions. Changes might not always work for everyone and every use case.
>
> If you are using this config directly, I suggest you **review the changes every time you update**. Or if you want more control over the rules, always feel free to fork it. Thanks!

## 📦 What’s included?

This package provides ready-to-use configurations for:

- **Code Formatting:** Prettier, Biome
- **Linting:** ESLint, Oxlint, Biome
- **TypeScript:** Best-practice defaults
- **CLI Tools:** Useful command-line tools for streamlining workflows

> [!Tip]
> You can use these configurations as-is or extend them to suit your project's specific needs.

## ⚙️ Installation

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

## 📐 Code Formatting

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
  // Add your overrides here...
};
```

### Biome

To use the Biome formatter, create a `biome.json` [configuration file](https://biomejs.dev/reference/configuration/):

```jsonc
{
  "extends": ["@yunarch/config-web/formatter-biome"],
  // Add your overrides here...
}
```

> [!IMPORTANT]
> If you are also using `@yunarch/config-web/linter-biome`, the formatter configuration `@yunarch/config-web/formatter-biome` must be placed **before** it in the configuration.
>
> ```jsonc
> {
>   "extends": [
>     "@yunarch/config-web/formatter-biome",
>     "@yunarch/config-web/linter-biome",
>   ],
>   // Add your overrides here...
> }
> ```

## 🧹 Linting

TODO

## 🔵 Typescript

Create the `tsconfig.json` file with the following content:

```jsonc
{
  "extends": "@yunarch/config-web/tsconfig-base",
  // Add your overrides here...
}
```

Additionally, this package includes a `ts-reset` configuration to enhance TypeScript's built-in types. To use it, create a `reset.d.ts` file in your project with the following content:

```ts
import "@yunarch/config-web/reset.d.ts";
```

Then, include this file in your `tsconfig.json`, for example:

```jsonc
{
  "extends": "@yunarch/config-web/tsconfig-base",
  "include": ["./reset.d.ts" /* other files... */],
  // Add your overrides here...
}
```

> [!TIP]
> You can use a glob pattern like `"include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]` to automatically include all relevant files, so you don't have to add them manually.

Learn more from [Typescript docs here](https://www.typescriptlang.org/tsconfig/#extends).

## 🔧 CLI Tools

This package ships with useful command-line tools to streamline your workflow.

- **`swagger-sync`**: CLI tool designed to synchronize a local Swagger file with a remote API and generate API models. It helps keep your API documentation up to date with your actual API and automatically generates models based on the Swagger specification.
- **`turbo-select`**: CLI tool for filtering and selecting a single package from your Turborepo package list and executing a script command. Additionally, it can prompt you to select an environment mode (development, staging, production) — useful for adjusting settings based on the environment (e.g., when using Vite).

> [!NOTE]
> All the CLI tools include a `--help` flag, which provides detailed information on usage and available options.
