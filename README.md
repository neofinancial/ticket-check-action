<p align="center">
  <a href="https://neofinancial.com">
    <img alt="Neo Financial" src="./.github/images/wordmark.svg" height="35" />
  </a>
</p>

<h1 align="center">
  PR Title Linter (GitHub Action)
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

In your `.github/workflows` folder, create a new `pull_request_linting.yml` file with the following contents.

```yml
# This is a basic workflow to help you get started with Actions
name: Pull Request Linting

# Controls when the action will run. Triggers the workflow on push or pull request
# events but only for the master branch
on:
  pull_request:
    types: ["opened", "edited", "reopened", "synchronize"]

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "title"
  title:
    name: "Title"
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      - name: PR Lint GitHub Action
        uses: neofinancial/action-prlint@master
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: "CH-"
          titleFormat: "%prefix%%id%: %title%"
          titleRegex: '^(CH)(-?)(\d{3,})'
          bodyRegex: '(CH)(-?)(\d{3,})'
          bodyURLRegex: 'http(s?):\/\/(app.clubhouse.io)(\/neofinancial)(\/story)\/\d+'
```