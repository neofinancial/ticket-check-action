# Pull Request Ticket Check Action

[![Build status](https://github.com/neofinancial/ticket-check-action/workflows/CI/badge.svg)](https://github.com/neofinancial/ticket-check-action/actions)

Verify that pull request titles start with a ticket ID

## Overview

This Github Action helps ensure that all pull requests have an associated ticket ID in their title.

It can detect the ID in the title of the pull request, in the branch name, whether a reference ID (`#123`) is in the body, or even if a full URL is in the body.

If no ticket/issue ID is in the title, it will extract the ID from the branch or body and update the title for you. It will fail the check if no ticket ID is found anywhere.

If a `ticketLink` input is provided and named groups `(?<ticketNumber>)` are used in regexes, a ticket link will be posted on a PR upon a successful match. This overrides the `quiet` option.

## Usage

In your `.github/workflows` folder, create a new `pull_request_linting.yml` file with the respective contents based on your needs.

The examples provided require some customizations unique to your codebase or issue tracking. If you're unfamiliar with building a regex, check out [Regexr](https://regexr.com/).

Make sure you check for the following to swap out with your values:

- `:owner` / `:org` - used in **all** examples
- `:repo` - used only in the GitHub example

## Examples

### GitHub

```yml
name: Pull Request Lint

on:
  pull_request:
    types: ['opened', 'edited', 'reopened', 'synchronize']

jobs:
  title:
    name: ticket check
    runs-on: ubuntu-latest

    steps:
      - name: Check for ticket
        uses: neofinancial/ticket-check-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketLink: 'https://github.com/:owner/:repo/issues/%ticketNumber%'
          ticketPrefix: '#'
          titleRegex: '^#(?<ticketNumber>\d+)'
          branchRegex: '^(?<ticketNumber>\d+)'
          bodyRegex: '#(?<ticketNumber>\d+)'
          bodyURLRegex: 'http(s?):\/\/(github.com)(\/:owner)(\/:repo)(\/issues)\/(?<ticketNumber>\d+)'
```

### Jira

```yml
name: Pull Request Lint

on:
  pull_request:
    types: ['opened', 'edited', 'reopened', 'synchronize']

jobs:
  title:
    name: ticket check
    runs-on: ubuntu-latest

    steps:
      - name: Check for ticket
        uses: neofinancial/ticket-check-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketLink: 'https://:org.atlassian.net/browse/PROJ-%ticketNumber%'
          ticketPrefix: 'PROJ-'
          titleRegex: '^PROJ-(?<ticketNumber>\d+)'
          branchRegex: '^PROJ-(?<ticketNumber>\d+)'
          bodyRegex: 'PROJ-(?<ticketNumber>\d+)'
          bodyURLRegex: 'http(s?):\/\/(:org.atlassian.net)(\/browse)\/(PROJ\-)(?<ticketNumber>\d+)'
```

### Clubhouse

```yml
name: Pull Request Lint

on:
  pull_request:
    types: ['opened', 'edited', 'reopened', 'synchronize']

jobs:
  title:
    name: ticket check
    runs-on: ubuntu-latest

    steps:
      - name: Check for ticket
        uses: neofinancial/ticket-check-action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketLink: 'https://app.clubhouse.io/:org/story/%ticketNumber%'
          ticketPrefix: 'CH-'
          titleRegex: '^(CH)(-?)(?<ticketNumber>\d{3,})'
          branchRegex: '^(CH)(-?)(?<ticketNumber>\d{3,})'
          bodyRegex: '(CH)(-?)(?<ticketNumber>\d{3,})'
          bodyURLRegex: 'http(s?):\/\/(app.clubhouse.io)(\/:org)(\/story)\/(?<ticketNumber>\d+)'
```

</details>

## Inputs

| Name              | Required | Description                                                                                                                                          | default                          |
| ----------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| token             | ✅       | The GitHub access token                                                                                                                              |                                  |
| ticketLink        |          | The URL format for a link to a ticket with a `%ticketNumber%` placeholder                                                                            |                                  |
| ticketPrefix      |          | The unique identifier for the ticket/issue                                                                                                           |                                  |
| titleFormat       |          | The intended format the title should be set to if it doesn't match the regular expression. Available variables are `%prefix%`, `%id%`, and `%title%` | %prefix%%id%: %title%            |
| titleRegex        |          | The regular expression used to search the title for the intended format                                                                              | ^(CH)(-?)(?<ticketNumber>\d{3,}) |
| titleRegexFlags   |          | The regular expression flags applied to the title regular expression                                                                                 | gi                               |
| branchRegex       |          | The regular expression used to search the branch for the intended format                                                                             | ^(CH)(-?)(?<ticketNumber>\d{3,}) |
| branchRegexFlags  |          | The regular expression flags applied to the branch regular expression                                                                                | gi                               |
| bodyRegex         |          | The regular expression used to search the body for a shorthand reference (example `#123`)                                                            | (CH)(-?)(?<ticketNumber>\d{3,})  |
| bodyRegexFlags    |          | The flags applied to the body regular expression when searching for a shorthand reference                                                            | gim                              |
| bodyURLRegex      |          | The regular expression used to search the body for a URL reference (example `https://github.com/octocat/hello-world/issues/1`)                       |                                  |
| bodyURLRegexFlags |          | The flags applied to the body regular expression when searching for a URL reference                                                                  | gim                              |
| exemptUsers       |          | Comma separated string of usernames that will be exempt from all checks. Most useful for bot/automated PRs (example "octocat,dependabot")            |                                  |
| quiet             |          | If `true`, don't comment when a PR title is updated                                                                                                  | true                             |
