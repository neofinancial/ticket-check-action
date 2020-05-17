/* eslint-disable @typescript-eslint/camelcase */

import { debug, getInput, setFailed } from '@actions/core';
import { context, GitHub } from '@actions/github';

// Helper function to retrieve ticket number from a string (either a shorthand reference or a full URL)
const extractId = (value: string): string | null => {
  const result = value.match(/\d+/);

  if (result !== null) {
    return result[0];
  }

  return null;
};

// Helper function to simplify the branch names
const getBranchName = (reference: string): string => reference.replace('refs/heads/', '');

async function run(): Promise<void> {
  try {
    // Check for a ticket reference in the title
    const title: string = context?.payload?.pull_request?.title;
    const titleRegexBase = getInput('titleRegex', { required: true });
    const titleRegexFlags = getInput('titleRegexFlags', {
      required: true
    });
    const titleRegex = new RegExp(titleRegexBase, titleRegexFlags);
    const titleCheck = title.match(titleRegex);

    debug(title);

    // Return and approve if the title includes a Ticket ID
    if (titleCheck !== null) {
      debug('Title includes a ticket ID');

      return;
    }

    // Instantiate a GitHub Client instance
    const token = getInput('token', { required: true });
    const client = new GitHub(token);
    const pullRequest = context.issue;

    // get the title format and ticket prefix
    const ticketPrefix = getInput('ticketPrefix', { required: true });
    const titleFormat = getInput('titleFormat', { required: true });

    // Check for a ticket reference in the branch
    const currentBranch = getBranchName(context.ref);
    const branchCheck = extractId(currentBranch);
    if (branchCheck !== null) {
      debug('Branch name contains a reference to a ticket, updating title');

      client.pulls.update({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        title: titleFormat
          .replace('%prefix%', ticketPrefix)
          .replace('%id%', branchCheck)
          .replace('%title%', title)
      });

      client.pulls.createReview({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        body:
          "Hey! I noticed that your PR contained a reference to the ticket in the branch name but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
        event: 'COMMENT'
      });
    }

    // Retrieve the pull request body and verify it's not empty
    const body = context?.payload?.pull_request?.body;

    if (body === undefined) {
      debug('Body is undefined');
      setFailed('Could not retrieve the Pull Request body');

      return;
    }

    debug(body);

    // Check for a ticket reference number in the body
    const bodyRegexBase = getInput('bodyRegex', { required: true });
    const bodyRegexFlags = getInput('bodyRegexFlags', { required: true });
    const bodyCheck = body.match(new RegExp(bodyRegexBase, bodyRegexFlags));

    if (bodyCheck !== null) {
      debug('Body contains a reference to a ticket, updating title');

      const id = extractId(bodyCheck[0]);

      if (id === null) {
        setFailed('Could not extract a ticket shorthand reference from the body');

        return;
      }

      client.pulls.update({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        title: titleFormat
          .replace('%prefix%', ticketPrefix)
          .replace('%id%', id)
          .replace('%title%', title)
      });

      client.pulls.createReview({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        body:
          "Hey! I noticed that your PR contained a reference to the ticket in the body but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
        event: 'COMMENT'
      });

      return;
    }

    // Last ditch effort, check for a ticket reference URL in the body
    const bodyURLRegexBase = getInput('bodyURLRegex', { required: true });
    const bodyURLRegexFlags = getInput('bodyURLRegexFlags', {
      required: true
    });
    const bodyURLRegex = new RegExp(bodyURLRegexBase, bodyURLRegexFlags);
    const bodyURLCheck = body.match(bodyURLRegex);

    if (bodyURLCheck !== null) {
      debug('Body contains a ticket URL, updating title');

      const id = extractId(bodyURLCheck[0]);

      if (id === null) {
        setFailed('Could not extract a ticket URL from the body');

        return;
      }

      client.pulls.update({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        title: titleFormat
          .replace('%prefix%', ticketPrefix)
          .replace('%id%', id)
          .replace('%title%', title)
      });

      client.pulls.createReview({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        body:
          "Hey! I noticed that your PR contained a reference to the ticket URL in the body but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
        event: 'COMMENT'
      });
    }

    if (titleCheck === null && branchCheck === null && bodyCheck === null && bodyURLCheck === null) {
      debug('Title, branch, and body do not contain a reference to a ticket');
      setFailed('No ticket was referenced in this pull request');

      return;
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
