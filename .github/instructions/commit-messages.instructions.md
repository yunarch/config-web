---
description: 'Guidelines for writing commit messages following Conventional Commits specification'
applyTo: '**'
---

# Commit Message Guidelines

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages. This structured format makes the commit history more readable and allows for automated tools to generate changelogs.

## Commit Message Structure

Each commit message consists of:

1. **Type** (required): What kind of change this commit is making
2. **Description** (required): A short description of the change (Max 100 characters).
3. **Body** (optional): A more detailed explanation of the change (100 characters per line).
4. **Footer** (optional): Information about breaking changes or issue references.

## Format

```
<type>: <description>

<body>

<footer>
```

## Types

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

## Description

- Use the imperative, present tense: "change" not "changed" nor "changes"
- Don't capitalize the first letter
- No period (.) at the end
- Max 100 characters

## Body

- Use the imperative, present tense
- Include motivation for the change and contrast with previous behavior
- Lines should not exceed 100 characters

## Breaking Changes

Breaking changes should start with the text `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for explaining the breaking change.

Another way to indicate a breaking change is to add ! directly after the <type>, for example:

```
feat!: drop support for Node 14
```

This shorthand signals that the commit introduces a breaking change, even if BREAKING CHANGE: is not explicitly used in the footer.

## Examples

```
feat: add project status indicator component

Add a new component that shows the status of a project with color coding
for different states (active, completed, pending)

Implements #123
```

```
fix: correct project fetching when no filters applied

The API was returning a 400 error when no filters were provided in the request.
This change ensures a default filter is applied when none is provided.

Fixes #456
```

```
refactor: simplify project navigation structure

BREAKING CHANGE: The URL pattern for accessing project details has changed
from /projects/{id} to /project/{id}
```
