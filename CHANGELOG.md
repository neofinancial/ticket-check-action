# Changelog

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
