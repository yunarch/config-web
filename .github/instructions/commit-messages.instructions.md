---
description: 'Guidelines for writing commit messages following Conventional Commits specification'
applyTo: '**'
---

# Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This structured format makes the commit history more readable and allows for automated tools to generate changelogs.

## Format

```
<type>: <gitmoji> <description>

<body>

<footer(s)>
```

1. **Type** (required): What kind of change this commit is making.
2. **gitmoji** (optional): An emoji to visually represent the type of change.
3. **Description** (required): A short description of the change (Max 100 characters).
4. **Body** (optional): A more detailed explanation of the change (100 characters per line).
5. **Footer** (optional): Information about breaking changes or issue references.

## Type

The following types are allowed:

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

## Gitmoji

- Use the [Gitmoji](https://gitmoji.dev/) standard for emojis.

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
fix: 🐛 prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Fixes: #(issue number)
```
