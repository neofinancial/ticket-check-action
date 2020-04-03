# Pull Request Title Action

[![Build status](https://github.com/neofinancial/pr-title-action/workflows/CI/badge.svg)](https://github.com/neofinancial/pr-title-action/actions)

Verify that pull request titles start with a ticket ID

## Overview

This Github Action helps ensure that all pull requests have an associated ticket ID in their title.

It can detect the ID in the title of the pull request, whether a reference ID (`#123`) is in the body, or even if a full URL is in the body.

If no ticket/issue ID is in the title, it will extract the ID from the body and update the title for you, or fail the check if no ticket ID is found.

## Usage

In your `.github/workflows` folder, create a new `pull_request_linting.yml` file with the respective contents based on your needs.

The examples provided require some customizations unique to your codebase or issue tracking. If you're unfamiliar with building a regex, check out [Regexr](https://regexr.com/).

Make sure you check for the following to swap out with your values:

- `:owner` / `:org` - used in **all** examples
- `:repo` - used only in the GitHub example

## Examples

### GitHub

```yml
name: Pull Request Linting

on:
  pull_request:
    types: ['opened', 'edited', 'reopened', 'synchronize']

jobs:
  title:
    name: 'Title'
    runs-on: ubuntu-latest

    steps:
      - name: PR Title Check
        uses: neofinancial/pr-title-action@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: '#'
          titleRegex: '^#(\d+)'
          bodyRegex: '#(\d+)'
          bodyURLRegex: 'http(s?):\/\/(github.com)(\/:owner)(\/:repo)(\/issues)\/\d+'
```

### JIRA

```yml
name: Pull Request Linting

on:
  pull_request:
    types: ['opened', 'edited', 'reopened', 'synchronize']

jobs:
  title:
    name: 'Title'
    runs-on: ubuntu-latest

    steps:
      - name: PR Title Check
        uses: neofinancial/pr-title-action@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: 'PROJ-'
          titleRegex: '^PROJ-(\d+)'
          bodyRegex: 'PROJ-(\d+)'
          bodyURLRegex: 'http(s?):\/\/(:org.atlassian.net)(\/browse)\/(PROJ\-)\d+'
```

### Clubhouse

```yml
name: Pull Request Linting

on:
  pull_request:
    types: ['opened', 'edited', 'reopened', 'synchronize']

jobs:
  title:
    name: 'Title'
    runs-on: ubuntu-latest

    steps:
      - name: PR Title Check
        uses: neofinancial/pr-title-action@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: 'CH-'
          titleRegex: '^(CH)(-?)(\d{3,})'
          bodyRegex: '(CH)(-?)(\d{3,})'
          bodyURLRegex: 'http(s?):\/\/(app.clubhouse.io)(\/:org)(\/story)\/\d+'
```

</details>

## Inputs

| Name              | Required | Description                                                                                                                                          | default               |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| token             | ✅       | The GitHub access token                                                                                                                              |                       |
| ticketPrefix      |          | The unique identifier for the ticket/issue                                                                                                           | #                     |
| titleFormat       |          | The intended format the title should be set to if it doesn't match the regular expression. Available variables are `%prefix%`, `%id%`, and `%title%` | %prefix%%id%: %title% |
| titleRegex        |          | The regular expression used to search the title for the intended format                                                                              | ^#(\d+)               |
| titleRegexFlags   |          | The regular expression flags applied to the title regular expression                                                                                 | gi                    |
| bodyRegex         |          | The regular expression used to search the body for a shorthand reference (example `#123`)                                                            | #(\d+)                |
| bodyRegexFlags    |          | The flags applied to the body regular expression when searching for a shorthand reference                                                            | gim                   |
| bodyURLRegex      |          | The regular expression used to search the body for a URL reference (example `https://github.com/octocat/hello-world/issues/1`)                       |                       |
| bodyURLRegexFlags |          | The flags applied to the body regular expression when searching for a URL reference                                                                  | gim                   |
