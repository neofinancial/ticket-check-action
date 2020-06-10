/* eslint-disable @typescript-eslint/camelcase */

import { debug, getInput, setFailed } from '@actions/core';
import { context, GitHub } from '@actions/github';

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

    client.pulls.update({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
      title: `${ticketPrefix} ${title}`
    });

    client.pulls.createReview({
      owner: pullRequest.owner,
      repo: pullRequest.repo,
      pull_number: pullRequest.number,
      body:
        "Hey! I noticed that your PR contained a reference to the ticket in the branch name but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
      event: 'COMMENT'
    });

    return;
  } catch (error) {
    setFailed(error.message);
  }
}

run();
