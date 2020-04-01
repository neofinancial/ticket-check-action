/* eslint-disable @typescript-eslint/camelcase */

import { debug, getInput, setFailed } from '@actions/core';
import { context, GitHub } from '@actions/github';

// Helper function to retrieve digits from a string (be it a ticket string or a full URL)
const extractId = (value: string): string | null => {
  const result = value.match(/\d+/);

  if (result !== null) {
    return result[0];
  }

  return null;
};

async function run(): Promise<void> {
  try {
    debug('Inside try block');

    // Check for a Clubhouse Ticket Reference in the Title
    const title: string = context?.payload?.pull_request?.title;
    const titleRegexBase = getInput('titleRegex', { required: true });
    const titleRegexFlags = getInput('titleRegexFlags', {
      required: true
    });
    const titleRegex = new RegExp(titleRegexBase, titleRegexFlags);
    const titleCheck = title.match(titleRegex);

    // Return and approve if the title includes a Ticket ID
    if (titleCheck !== null) {
      debug('Title includes a ticket ID.');
      debug('Exiting...');

      return;
    } else {
      debug('Title does not include a ticket ID.');
      debug('Continuing...');
    }

    debug(title);

    // Retrieve the Pull Request body contents and verify it's not empty
    const body = context?.payload?.pull_request?.body;

    if (body === undefined) {
      debug('Body is undefined.');
      setFailed('Could not retrieve the Pull Request body');
      debug('Exiting...');

      return;
    } else {
      debug('Body contains content.');
      debug('Continuing...');
    }

    // Instantiate a GitHub Client Instance
    const token = getInput('token', { required: true });
    const client = new GitHub(token);
    const pullRequest = context.issue;

    debug('Connected to GitHub Client.');
    debug('Continuing...');

    // Check for a Clubhouse Ticket Reference Number found in the body
    const bodyRegexBase = getInput('bodyRegex', { required: true });
    const bodyRegexFlags = getInput('bodyRegexFlags', { required: true });
    const bodyCheck = body.match(new RegExp(bodyRegexBase, bodyRegexFlags));

    // Load in the requested title format and ticket prefix
    const ticketPrefix = getInput('ticketPrefix', { required: true });
    const titleFormat = getInput('titleFormat', { required: true });

    if (bodyCheck !== null) {
      debug('Body contains a reference to a ticket.');
      debug(`Updating the title`);

      const id = extractId(bodyCheck[0]);

      if (id === null) {
        setFailed('Count not extract a Ticket ID from the body');

        return;
      }

      client.pulls.update({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        number: pullRequest.number,
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
    } else {
      debug('Body does NOT contain a reference to a ticket.');
      debug('Continuing...');
    }

    // Last Ditch Effort
    // Check for a Clubhouse Ticket Reference URL linked in the body
    const bodyURLRegexBase = getInput('bodyURLRegex', { required: true });
    const bodyURLRegexFlags = getInput('bodyURLRegexFlags', {
      required: true
    });
    const bodyURLRegex = new RegExp(bodyURLRegexBase, bodyURLRegexFlags);
    const bodyURLCheck = body.match(bodyURLRegex);

    if (bodyURLCheck !== null) {
      debug('This Pull Request body contains a URL to a ticket.');
      debug(`Updating the Pull Request title`);

      const id = extractId(bodyURLCheck[0]);

      if (id === null) {
        setFailed('Count not extract a Ticket ID from the body');

        return;
      }

      client.pulls.update({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        number: pullRequest.number,
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
    } else {
      debug('Body does NOT contain a URL to a ticket.');
      debug('Continuing...');
    }

    debug(body);

    if (titleCheck === null && bodyCheck === null && bodyURLCheck === null) {
      debug('Body does NOT contain a any reference to a ticket.');
      setFailed('No ticket was referenced in this pull request.');
      debug('Exiting...');

      return;
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
