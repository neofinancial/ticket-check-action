<p align="center">
  <a href="https://neofinancial.com">
    <img alt="Neo Financial" src="./.github/images/wordmark.svg" height="35" />
  </a>
</p>

<h1 align="center">
  Pull Request Title Linter
</h1>

<h3 align="center">
  Verify that your pull request titles start with a ticket ID
</h3>

<p align="center">
  <a href="https://github.com/neofinancial/action-prlint/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Released under the MIT license." />
  </a>
</p>

## Introduction

This Github Action helps ensure that all pull requests will have an associated ticket ID in their title.

It can detect the ID in the title of the pull request, whether a reference ID (`#123`) is in the body, or even if a full URL is in the body.

If no ticket/issue ID is in the title, it will extract the ID from the body and help by updating your title for you, or fail the check and block a merge if no ticket ID is found.

## Usage

In your `.github/workflows` folder, create a new `pull_request_linting.yml` file with the respective contents based on your needs.

The examples provided require some customizations unique to your codebase or issue tracking. If you're unfamiliar with building a regex, check out [Regexr](https://regexr.com/).

Make sure you check for the following to swap out with your values.

- `:owner` / `:org` - used in the **all** examples
- `:repo` - used only in the GitHub example

## Examples

<details open>
  <summary>GitHub</summary>

```yml
name: Pull Request Linting

on:
  pull_request:
    types: ["opened", "edited", "reopened", "synchronize"]

jobs:
  title:
    name: "Title"
    runs-on: ubuntu-latest

    steps:
      - name: PR Lint GitHub Action
        uses: neofinancial/action-prlint@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: "#"
          titleRegex: '^#(\d+)'
          bodyRegex: '#(\d+)'
          bodyURLRegex: 'http(s?):\/\/(github.com)(\/:owner)(\/:repo)(\/issues)\/\d+'
```
</details>

<details>
  <summary>JIRA</summary>

```yml
name: Pull Request Linting

on:
  pull_request:
    types: ["opened", "edited", "reopened", "synchronize"]

jobs:
  title:
    name: "Title"
    runs-on: ubuntu-latest

    steps:
      - name: PR Lint GitHub Action
        uses: neofinancial/action-prlint@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: "PROJ-"
          titleRegex: '^PROJ-(\d+)'
          bodyRegex: 'PROJ-(\d+)'
          bodyURLRegex: 'http(s?):\/\/(:org.atlassian.net)(\/browse)\/(PROJ\-)\d+'
```
</details>

<details>
  <summary>Clubhouse</summary>

```yml
name: Pull Request Linting

on:
  pull_request:
    types: ["opened", "edited", "reopened", "synchronize"]

jobs:
  title:
    name: "Title"
    runs-on: ubuntu-latest

    steps:
      - name: PR Lint GitHub Action
        uses: neofinancial/action-prlint@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: "CH-"
          titleRegex: '^(CH)(-?)(\d{3,})'
          bodyRegex: '(CH)(-?)(\d{3,})'
          bodyURLRegex: 'http(s?):\/\/(app.clubhouse.io)(\/:org)(\/story)\/\d+'
```
</details>

## Inputs

|Name | Required | Description| default |
|---|----|---|---|
| token | ✅ | The GitHub provided access token |  |
| ticketPrefix | no | The unique identifier for the ticket/issue | # |
| titleFormat | no | The intended format the title should be edited to it if does not match the regex. Contains variables `%prefix%`, `%id%`, and `%title%` | %prefix%%id%: %title% |
| titleRegex | no | The regular expression used to search the title for the intended format| ^#(\d+)|
| titleRegexFlags | no | The flags applied to the title regex | gi |
| bodyRegex | no | The regular expression used to search the body for a shorthand reference (example `#123`) |#(\d+) |
| bodyRegexFlags | no | The flags applied to the body regex whilst searching for the reference | gim |
| bodyURLRegex | no | The regular expression used to search the body for a URL reference (example `https://github.com/octocat/Hello-World/issues/1`) |  |
| bodyURLRegexFlags | no | The flags applied to the body regex whilst searching for the URL reference | gim |