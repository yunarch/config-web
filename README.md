<h1><a href="https://npm.im/@yunarch/config-web">@yunarch/config-web</a></h1>

> A curated set of linters (ESLint, Oxlint), formatters (Prettier, Biome), TypeScript configurations for web projects, and useful CLI tools.

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
  - [ESlint](#eslint)
    - [Override configuration](#override-configuration)
    - [Typescript Type aware rules](#typescript-type-aware-rules)
    - [Enabling ESLint and Oxlint Simultaneously](#enabling-eslint-and-oxlint-simultaneously)
  - [Oxlint](#oxlint)
- [🔵 Typescript](#-typescript)
- [🔧 CLI Tools](#-cli-tools)
- [📜 License](#-license)

## 📖 Why use this?

Even experienced developers can waste valuable time configuring tools from scratch. Instead of manually setting up linters, formatters, and TypeScript settings, this package provides a ready-to-use configuration that is both easy to implement and extensible. It helps maintain clean, consistent code without the overhead of ongoing tools configuration maintenance allowing users to choose between traditional options (e.g., Prettier, ESlint) and more performant alternatives (e.g., Biome, Oxlint).

> [!IMPORTANT]
> Please keep in mind that this is still **a personal config** with a lot of opinions. Changes might not always work for everyone and every use case.
>
> If you are using this config directly, I suggest you **review the changes every time you update**. Or if you want more control, always feel free to fork it. Thanks!

## 📦 What’s included?

This package provides ready-to-use configurations for:

- **Code Formatting:** Prettier, Biome
- **Linting:** ESLint, Oxlint
- **TypeScript:** Best-practice default config.
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
"prettier": "@yunarch/config-web/prettier"
```

Or you can create a [configuration file](https://prettier.io/docs/configuration) to also allow further customization:

```js
import defaultConfig from "@yunarch/config-web/prettier";

/** @type {import("prettier").Options} */
export default {
  ...defaultConfig,
  // Add your overrides here...
};
```

> Add a `.prettierignore` file to ignore certain files and folder completly or use the CLI option [--ignore-path](https://prettier.io/docs/cli#--ignore-path) to indicate a path to a file containing patterns that describe files to ignore. By default, Prettier looks for `./.gitignore` and `./.prettierignore`.

### Biome

To use the Biome formatter, create a `biome.json` [configuration file](https://biomejs.dev/reference/configuration/):

```jsonc
{
  "extends": ["@yunarch/config-web/biome-formatter"],
  // Add your overrides here...
}
```

> [!IMPORTANT]
> We disable the `organizeImports` options as we want that to be manage by the linter configuration that we offer. feel free to enable it if you prefer to use Biome for these tasks. Remember to disable it on the configuration for the ESlinter if you use it.

> Enable [vcs.useIgnoreFile](https://biomejs.dev/guides/integrate-in-vcs/#use-the-ignore-file), to allow Biome to ignore all the files and directories listed in your VCS ignore file.

## 🧹 Linting

We offer a strict yet configurable ESLint setup with autocomplete support. Additionally, since the ESLint ecosystem is extensive but can sometimes be slow, this configuration allows leveraging Oxlint for certain rules, boosting speed without compromising flexibility.

For small projects, `Oxlint` or enabling the linter in `Biome` should be sufficient. However, for big projects or if you want to maintain consistent code style across multiple projects, we recommend ESlint and for performance boost ESlint + Oxlint.

### ESlint

To use the ESlint linter, create a [ESlint configuration file](https://eslint.org/docs/latest/use/configure/configuration-files):

Typically, you only need to use the `config` configuration as it is:

```js
// eslint.config.js
import { config } from "@yunarch/config-web/eslint";

export default config();
```

And that's it! However, if needed, you can configure each integration individually:

```js
import { config } from "@yunarch/config-web/eslint";

export default config({
  typescript: true,
  jsdoc: false,
  import: false,
  // Others
});
```

The `config` function also accepts multiple custom configuration overrides:

```js
import { config } from "@yunarch/config-web/eslint";

export default config(
  {
    // Configures for provided config
  },
  // From the second arguments they are ESLint Flat Configs
  // you can have multiple configs
  {
    files: ["**/*.ts"],
    rules: {},
  },
  {
    rules: {},
  }
);
```

> Thanks to [antfu/eslint-config](https://github.com/antfu/eslint-config) for the inspiration, reference, and developed tools.

#### Override configuration

Thanks to [eslint-flat-config-utils](https://github.com/antfu/eslint-flat-config-utils) we returns a flat config composer where you can chain methods and compose the configuration in different ways.

```js
// eslint.config.js
import { config } from "@yunarch/config-web/eslint";

export default config()
  // overrides any named configs
  .override("yunarch/unicorn/rules", {
    rules: {
      "unicorn/no-array-for-each": "off",
    },
  })
  // Override a whole configuration by a custom function to replace the config entirely.
  .override("yunarch/perfectionist/rules", (config) => {
    return {
      ...config,
      rules: {
        "perfectionist/sort-imports": "off",
      },
    };
  })
  // Provide overrides to multiple configs as an object map.
  // Same as calling override multiple times.
  .overrides({
    "yunarch/unicorn/rules": {
      rules: {
        "unicorn/no-array-for-each": "off",
      },
    },
  })
  .overrideRules({
    // Override rules in all configs.
  });
```

> [!TIP]
> There are other methods such as `remove`, `removeRules`, `append`, `insertBefore`, etc. These methods help you configure the linter to suit your specific needs.

#### Typescript Type aware rules

By providing the `tsconfigPath` in the `typescript` configuration it will automatically enable [type aware rules](https://typescript-eslint.io/getting-started/typed-linting/) which may/will impact the linter's performance.

```js
import { config } from "@yunarch/config-web/eslint";

export default config({
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
});
```

> [!NOTE]
> You can pass `disableTypeAware: true` to disable type-aware rules while keeping the TypeScript parser configuration which will allow you to manually enable the type-aware rules you want.

#### Enabling ESLint and Oxlint Simultaneously

If you want to offload certain rules to Oxlint, which will reduce linting time, you can configure it as follows:

```js
import { config } from "@yunarch/config-web/eslint";

export default config({
  oxlint: {
    oxlintConfigPath: "./.oxlintrc.json",
  },
});
```

> [!NOTE]
> This setup automatically detects which rules are specified in the Oxlint configuration and disables them in ESLint accordingly.

### Oxlint

To use the oxlint linter, create a `.oxlintrc.json` [configuration file](https://oxc.rs/docs/guide/usage/linter/config.html):

```jsonc
{
  "extends": ["@yunarch/config-web/oxlint"],
  "rules": {
    // Add your rules overrides here...
  },
  "overrides": [
    // Add your configuration overrides here..
  ],
}
```

If you want to enable or disable specific plugins, you must provide the full list of [plugins](https://oxc.rs/docs/guide/usage/linter/plugins.html#supported-plugins) to be used:

```jsonc
{
  "extends": ["@yunarch/config-web/oxlint"],
  "plugins": ["typescript", "unicorn", "react", "nextjs"], // Add all the plugins you want to use
  // ...
}
```

> [!WARNING]
> Setting the `plugins` field will overwrite the base set of plugins. The plugins array should reflect all of the plugins you want to use.
>
> By default it will use `"plugins": ["typescript", "unicorn", "react", "oxc"]`.

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

- **`openapi-sync`**: CLI tool designed to convert OpenAPI 3.0/3.1 schemas to TypeScript types and create type-safe fetching based on a openapi schema file and keep them in sync.
- **`turbo-select`**: CLI tool for filtering and selecting a single package from your Turborepo package list and executing a script command. Additionally, it can prompt you to select an environment mode (development, staging, production) — useful for adjusting settings based on the environment (e.g., when using Vite).

> [!NOTE]
> All the CLI tools include a `--help` flag, which provides detailed information on usage and available options.

> [!IMPORTANT]
> These tools are **a personal configuration** with a lot of opinions. They might not work for everyone or every use case. Additionally, tools can be added or removed without being considered a breaking change.

## 📜 License

MIT License © 2025-Present [@yunarch](https://github.com/yunarch)
