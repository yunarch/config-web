<h1>@yunarch/config-web</h1>

[![NPM version](https://img.shields.io/npm/v/@yunarch/config-web?color=3eb910&label=)](https://www.npmjs.com/package/@yunarch/config-web)

> A curated set of configurations and useful CLI tools for web projects.

> [!NOTE]
> This package is pure [ESM](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). This means you need to ensure to use an **ESM-Compatible Environment** (Your runtime or bundler must support ESM) and enable **Package Type module** by adding the following to you `package.json`:
>
> ```json
> "type": "module"
> ```

- [📖 Why use this?](#-why-use-this)
- [📦 What’s included?](#-whats-included)
- [⚙️ Installation](#️-installation)
- [Prettier](#prettier)
- [Oxfmt](#oxfmt)
- [ESlint](#eslint)
  - [Override configuration](#override-configuration)
  - [Typescript Type aware rules](#typescript-type-aware-rules)
- [Oxlint](#oxlint)
  - [Typescript Type aware rules](#typescript-type-aware-rules-1)
  - [Running Oxlint and ESLint together](#running-oxlint-and-eslint-together)
- [Typescript](#typescript)
  - [ts-reset](#ts-reset)
  - [Utilities](#utilities)
- [🔧 CLI Tools](#-cli-tools)
- [📜 License](#-license)

## 📖 Why use this?

Even experienced developers can waste valuable time configuring tools from scratch. Instead of manually setting up linters, formatters, and TypeScript settings, this package provides a ready-to-use configuration that is both easy to implement and extensible. It helps maintain clean, consistent code without the overhead of ongoing tools configuration maintenance allowing users to choose between traditional options (e.g., Prettier, ESlint) and more performant alternatives (e.g., Oxfmt, Oxlint).

> [!IMPORTANT]
> Please keep in mind that this is still **a personal config** with a lot of opinions. Changes might not always work for everyone and every use case.
>
> If you are using this config directly, I suggest you **review the changes every time you update**. Or if you want more control, always feel free to fork it. Thanks!

## 📦 What’s included?

This package provides ready-to-use configurations for:

- **Shared configs for Code Style & Linting:** Pre-configured yet extensible setups for Prettier and ESLint, offering high-performance alternatives via Oxfmt and Oxlint.
- **TypeScript:** Best-practice default config and utilities.
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

// To use eslint
npm install --save-dev eslint

// To use Oxfmt
npm install --save-dev oxfmt

// To use Oxlint
npm install --save-dev oxlint oxlint-tsgolint
```

## Prettier

The easiest way to use the `prettier` configuration as-is is to set it directly in your `package.json`:

```json
"prettier": "@yunarch/config-web/prettier"
```

Or you can create a [configuration file](https://prettier.io/docs/configuration) to also allow further customization:

```js
import defaultConfig from '@yunarch/config-web/prettier';

/** @type {import("prettier").Options} */
export default {
  ...defaultConfig,
  // Add your overrides here...
};
```

> [!TIP]
> Add a `.prettierignore` file to ignore certain files and folder completly or use the CLI option [--ignore-path](https://prettier.io/docs/cli#--ignore-path) to indicate a path to a file containing patterns that describe files to ignore.
>
> By default, Prettier looks for `./.gitignore` and `./.prettierignore`.

## Oxfmt

To use `Oxfmt`, create a `.oxfmtrc.json` [configuration file](https://oxc.rs/docs/guide/usage/formatter/config.html) and extend the shared preset:

```jsonc
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "extends": ["@yunarch/config-web/oxfmt"],
}
```

> [!NOTE]
> `Oxfmt` uses `ignorePatterns` in its configuration file instead of `.prettierignore` file but for compatibility, `.prettierignore` file is also supported.
>
> See [Oxfmt ignore files](https://oxc.rs/docs/guide/usage/formatter/ignore-files.html) for details.

> [!CAUTION]
> Currently, `Oxfmt` does not extends configuration:
> https://github.com/oxc-project/oxc/issues/16394

## ESlint

To use the ESlint linter, create a [ESlint configuration file](https://eslint.org/docs/latest/use/configure/configuration-files):

```js
// eslint.config.js
import { config } from '@yunarch/config-web/eslint';

export default config();
```

And that's it! However, if needed, you can configure each integration individually:

```js
import { config } from '@yunarch/config-web/eslint';

export default config({
  typescript: true,
  jsdoc: false,
  import: false,
  // Others
});
```

The `config` function also accepts multiple custom configuration overrides:

```js
import { config } from '@yunarch/config-web/eslint';

export default config(
  {
    // Configures for provided config
  },
  // From the second arguments they are ESLint Flat Configs
  // you can have multiple configs
  {
    files: ['**/*.ts'],
    rules: {},
  },
  {
    rules: {},
  }
);
```

> Thanks to [antfu/eslint-config](https://github.com/antfu/eslint-config) for the inspiration, reference, and developed tools.

### Override configuration

Thanks to [eslint-flat-config-utils](https://github.com/antfu/eslint-flat-config-utils) we returns a flat config composer where you can chain methods and compose the configuration in different ways.

```js
// eslint.config.js
import { config } from '@yunarch/config-web/eslint';

export default config()
  // overrides any named configs
  .override('yunarch/unicorn/rules', {
    rules: {
      'unicorn/no-array-for-each': 'off',
    },
  })
  // Override a whole configuration by a custom function to replace the config entirely.
  .override('yunarch/perfectionist/rules', (config) => {
    return {
      ...config,
      rules: {
        'perfectionist/sort-imports': 'off',
      },
    };
  })
  // Provide overrides to multiple configs as an object map.
  // Same as calling override multiple times.
  .overrides({
    'yunarch/unicorn/rules': {
      rules: {
        'unicorn/no-array-for-each': 'off',
      },
    },
  })
  .overrideRules({
    // Override rules in all configs.
  });
```

> [!TIP]
> There are other methods such as `remove`, `removeRules`, `append`, `insertBefore`, etc. These methods help you configure the linter to suit your specific needs.

### Typescript Type aware rules

By providing the `tsconfigPath` in the `typescript` configuration it will automatically enable [type aware rules](https://typescript-eslint.io/getting-started/typed-linting/) which may/will impact the linter's performance.

```js
import { config } from '@yunarch/config-web/eslint';

export default config({
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
});
```

> [!NOTE]
> You can pass `disableTypeAware: true` to disable type-aware rules while keeping the TypeScript parser configuration which will allow you to manually enable the type-aware rules you want.

## Oxlint

To use the oxlint linter, create a `.oxlintrc.json` [configuration file](https://oxc.rs/docs/guide/usage/linter/config.html):

```jsonc
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["@yunarch/config-web/oxlint"],
  "categories": { "correctness": "error", "perf": "error" },
  "rules": {
    // Add your rules overrides here...
  },
  "overrides": [
    // Add your configuration overrides here..
  ],
}
```

> [!TIP]
> For optimal results, we recommend setting the [categories](https://oxc.rs/docs/guide/usage/linter/config.html#enabling-groups-of-rules-categories) `correctness` and `perf` to `error` as shown above. However, feel free to enable any categories you prefer or need.

> [!CAUTION]
> Currently, `Oxlint` does not resolve configuration file paths automatically. To extend a config, you must explicitly provide the full path, like so:
> `"extends": ["./node_modules/@yunarch/config-web/dist/config.oxlint.json"]`

### Typescript Type aware rules

`Oxlint` Type-aware linting requires an additional dependency:

```
npm install --save-dev oxlint-tsgolint
```

To run `Oxlint` with type-aware linting, you must pass the `--type-aware` flag:

```
oxlint --type-aware
```

> [!TIP]
> In editor and LSP-based integrations like VS Code, type-aware linting can be enabled by setting the `typeAware` option to `true`, see the [Editors](https://oxc.rs/docs/guide/usage/linter/editors.html) page for more information.

> [!WARNING]
> Type-aware linting is powered by typescript-go so TypeScript 7.0+ is required.

### Running Oxlint and ESLint together

If not all required rules are available in `Oxlint`, you can run `Oxlint` and `ESLint` side by side.

Because `Oxlint` is significantly faster than `ESLint`, it is recommended to run `Oxlint` first to catch errors early, then fall back to `ESLint` only when necessary:

```sh
oxlint && eslint
```

To offload rules to `Oxlint` and significantly reduce overall linting time, you can configure `ESlint` as follows:

```js
import { config } from '@yunarch/config-web/eslint';

export default config({
  oxlint: {
    oxlintConfigPath: './.oxlintrc.json',
  },
});
```

This reduces duplicate diagnostics, can help cut down your linting time considerably, and allows `ESLint` to focus only on rules that `Oxlint` does not yet support.

> [!NOTE]
> Once remaining important rules have been added in `Oxlint` you should consider moving fully to `Oxlint` if you want to use that one to simplify your setup and reduce the number of dependencies for your project.

## Typescript

Create the `tsconfig.json` file with the following content:

```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@yunarch/config-web/tsconfig-base",
  // Add your overrides here...
}
```

Learn more from [Typescript docs here](https://www.typescriptlang.org/tsconfig/#extends).

### ts-reset

This package also includes a [`ts-reset`](https://www.totaltypescript.com/ts-reset) configuration to enhance TypeScript's built-in types. To use it, create a `reset.d.ts` file in your project with the following content:

```ts
import '@yunarch/config-web/ts-reset.d.ts';
```

Then, include this file in your `tsconfig.json`, for example:

```jsonc
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "@yunarch/config-web/tsconfig-base",
  "include": ["./reset.d.ts" /* other files... */],
  // Add your overrides here...
}
```

> [!TIP]
> You can use a glob pattern like `"include": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]` to automatically include all relevant files, so you don't have to add them manually.

### Utilities

As an enhancement to the `ts-reset`, this package provides type-level utilities to help you write stricter, more maintainable TypeScript code.

TypeScript uses structural typing, which means it doesn't always prevent objects from having excess properties. While `ts-reset` modifies built-in types globally, these utilities are **opt-in**, allowing you to apply stricter typing **only where you need it**.

> [!NOTE]
> This package only provides **types**, as the package is intended to be used as a `devDependency` **only**. So you need to create runtime type-safe wrappers. **Each utility type includes usage guidance in its definition comments**.

For example, using the exposed utility types, you can define strictly typed versions of `Object.entries` and `Object.fromEntries`, ensuring safer and more predictable object manipulation:

```ts
import type {
  ObjectEntries,
  ObjectFromEntries,
} from '@yunarch/config-web/ts-utils.d.ts';

// Strictly typed version of `Object.entries`
const typedObjectEntries: ObjectEntries = Object.entries;
const x1 = typedObjectEntries({ a: 1, b: 2 } as const);

// Strictly typed version of `Object.fromEntries`
const typedObjectFromEntries: ObjectFromEntries = Object.fromEntries;
const x2 = typedObjectFromEntries([['a', 1]] as const);
```

## 🔧 CLI Tools

This package ships with useful command-line tools to streamline your workflow.

- **[`bun-run-all`](./src/cli/__docs__/bun-run-all.md)**: CLI tool for running npm package scripts in parallel or sequential by using bun.
- **[`openapi-sync`](./src/cli/__docs__/openapi-sync.md)**: CLI tool designed to convert OpenAPI 3.0/3.1 schemas to TypeScript types and create type-safe fetching based on a openapi schema file and keep them in sync.
- **[`openapi-sync-lint-msw-handlers`](./src/cli/__docs__/openapi-sync-lint-msw-handlers.md)**: CLI tool for linting and identifying missing MSW (Mock Service Worker) handlers based on OpenAPI generated services. It analyzes your codebase to find where service methods are used and suggests appropriate handlers with detailed reporting.
- **[`turbo-select`](./src/cli/__docs__/turbo-select.md)**: CLI tool for filtering and selecting a single package from your Turborepo package list and executing a script command. Additionally, it can prompt you to select an environment mode (development, staging, production) — useful for adjusting settings based on the environment (e.g., when using Vite).

> [!IMPORTANT]
> These tools are **a personal configuration** with a lot of opinions. They might not work for everyone or every use case. Additionally, tools can be added or removed without being considered a breaking change.

## 📜 License

MIT License © 2025-Present [@yunarch](https://github.com/yunarch)
