# Changelog

## 2.0.0 (Apr 20, 2023)
Set action node version to 16
Update `EndBug/add-and-commit` to V9
Update `@actions/core` to `1.10.0`
Update `@actions/github` to `5.0.0`
Update `@types/node` to `16.11.7`
Update `@vercel/ncc` to `0.36.1`
Update `eslint` to `8.34.0`
Update `eslint-config-neo` to `0.7.0`
Update `husky` to `8.0.3`
Update `lint-staged` to `13.2.1`
Update `prettier` to `2.8.7`
Update `typescript` to `4.7.4`

## 1.5.0 (Feb 16, 2023)

Changed the order of checks to do title last as the other checks can impact it by changing the title.

Previously it was possible for the initial title check to get skipped, and later title checks to be hit as the title has been changed.

## 1.4.1 (Oct 16, 2021)

Switch to npm
Update eslint to 7.x

## 1.4.0 (November 8, 2020)

Add `ticketLink` input for automatically linking to tickets using `(?<ticketNumber>)` group in `titleRegex`, `branchRegex` and `bodyRegex`.
Make `bodyURLRegex` optional and remove default.

## 1.3.3 (September 30, 2020)

Make ticket prefix optional

## 1.3.2 (July 30, 2020)

Make `quiet` option default to `true`

## 1.3.1 (July 20, 2020)

Fix bug with `exemptUsers` field.

## 1.3.0 (June 28, 2020)

Allow silencing of the PR title update comment.

## 1.2.1 (June 20, 2020)

Fix a configuration bug marking the new `exemptUsers` field as true creating a breaking change. This is now an optional field as intended.

## 1.2.0 (June 17, 2020)

Provide a configuration option to exempt users from the action rules. Most useful for automated and bot PRs.

## 1.1.0 (May 17, 2020)

Added detection of ticket checking to include branches

## 1.0.0 (April 8, 2020)

Initial release! :tada:
