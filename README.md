# Pull Request Prepend Text

## Overview

Prepend text to an existing Pull Request. This is an adaptation, not an extension of [https://github.com/neofinancial/ticket-check-action][ticket-check-action].

I'm using it in conjunction with the Jira Create ticket action, and some badly written Github Actions scripts, if you know better, I'd be happy to accept a pull request.

## Usage

In your `.github/workflows` folder, create a new `pull_request_linting.yml` file with the respective contents based on your needs.

The examples provided require some customizations unique to your codebase or issue tracking. If you're unfamiliar with building a regex, check out [Regexr](https://regexr.com/).

Make sure you check for the following to swap out with your values:

- `:owner` / `:org` - used in **all** examples
- `:repo` - used only in the GitHub example

## Examples

### Github

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
        uses: ransbymich/ticket-check-action@v1.1.0
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          ticketPrefix: '#'
```

## Inputs

| Name         | Required | Description                                | default |
| ------------ | -------- | ------------------------------------------ | ------- |
| token        | ✅       | The GitHub access token                    |         |
| ticketPrefix |          | The unique identifier for the ticket/issue | #       |

## Caveat

There is limitation currently in the way GitHub triggers their checks. If the pull request fails, a new commit is required (even as simple as an empty one `git commit -m "retrigger checks" --allow-empty` ) to flush the old statuses and re-run a new sequence of checks.

For updates see the community forum thread here: https://github.community/t5/GitHub-Actions/Editing-a-PR-title-or-first-comment-causing-a-pile-up-of-runs/td-p/53932

[ticket-check-action]: https://github.com/neofinancial/ticket-check-action
