# Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This structured format makes the commit history more readable and allows for automated tools to generate changelogs.

## Format

```
<type>: <description>

<body>

<footer(s)>
```

1. **Type** (required): What kind of change this commit is making.
2. **Description** (required): A short description of the change (Max 100 characters).
3. **Body** (optional): A more detailed explanation of the change (100 characters per line).
4. **Footer** (optional): Information about breaking changes or issue references.

## Type

The following types are allowed. Always pick the most specific.

- **feat**: A new end-user capability or behavior. Only use when the change surfaces new functionality to stakeholders.
- **fix**: A bug fix, regression patch, or defect mitigation, even if the code also adds tests.
- **docs**: Documentation-only updates (README, ADRs, inline docs) that do not affect code.
- **style**: Formatting-only adjustments that do not change runtime behavior (spacing, lint fixes).
- **refactor**: Structural or internal code changes that neither fix a bug nor add a user-visible feature. Do not use `feat` for pure refactors.
- **perf**: A change whose goal is performance improvement (speed, memory, resource usage).
- **test**: Adding or adjusting tests without modifying production behavior.
- **build**: Tooling, compiler, bundler, or dependency changes that impact the build pipeline.
- **ci**: Updates to CI workflows, pipelines, or automation scripts.
- **chore**: Repository maintenance that does not touch `src/` or tests (e.g., config, scripts, dependency bumps).
- **revert**: Reverts a previous commit.

### Choosing the right type

- Reserve `feat` for changes a user can notice (new routes, buttons, API capabilities). Everything else should use a more specific type.
- Use `fix` whenever you resolve a defect, even if the implementation contains new functionality internally.
- Prefer `refactor` for code reshuffles, component extractions, or renames that keep behavior the same.
- Tag dependency bumps, tooling tweaks, and scripts as `build` or `chore` depending on whether they affect the build system.
- Use `test` for test-only commits and `docs` for documentation-only commits; mixing them with `feat` makes the changelog noisy.
- CI workflow updates belong to `ci`, and performance-focused work should be `perf`.

## Description

- Use the imperative, present tense: "change" not "changed" nor "changes".
- Don't capitalize the first letter.
- No period (.) at the end.
- Max 100 characters.

## Body

- Use the imperative, present tense.
- Include motivation for the change and contrast with previous behavior.
- A longer commit body MAY be provided after the short description, providing additional contextual information about the code changes. The body MUST begin one blank line after the description and with maximum 100 characters per line.
- A commit body is free-form and MAY consist of any number of newline separated paragraphs.

## Footer(s)

- Use the footer to reference issues or breaking changes.
- One or more footers MAY be provided one blank line after the body. Each footer MUST consist of a word token, followed by either a `:<space>` or `<space>#` separator, followed by a string value.
- A footer's token MUST use `-` in place of whitespace characters, e.g., `Acked-by` (this helps differentiate the footer section from a multi-paragraph body). An exception is made for `BREAKING CHANGE`, which MAY also be used as a token.
- A footer's token MUST not be any of the types listed above.
- A footer's value MAY contain spaces and newlines, and parsing MUST terminate when the next valid footer token/separator pair is observed.
- Lines should not exceed 100 characters.

## Breaking Changes

Breaking changes can be indicated in the footer with a `BREAKING CHANGE:` section, by appending `!` to the type/scope or both.

For example:

**Commit message with ! to draw attention to breaking change**

```
feat!: send an email to the customer when a product is shipped
```

**Commit message with description and breaking change footer**

```
feat: add new authentication method

BREAKING CHANGE: This changes the authentication flow.
```

**Commit message with both ! and BREAKING CHANGE footer**

```
chore!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```

## Example

```
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Fixes: #(issue number)
```
