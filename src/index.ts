/* eslint-disable @typescript-eslint/camelcase */

import { debug as log, getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

// Helper function to retrieve ticket number from a string (either a shorthand reference or a full URL)
const extractId = (value: string): string | null => {
  const result = value.match(/\d+/);

  if (result !== null) {
    return result[0];
  }

  return null;
};

const debug = (label: string, message: string): void => {
  log('');
  log(`[${label.toUpperCase()}]`);
  log(message);
  log('');
};

async function run(): Promise<void> {
  try {
    // Provide complete context object right away if debugging
    debug('context', JSON.stringify(context));

    // Check for a ticket reference in the title
    const title: string = context?.payload?.pull_request?.title;
    const titleRegexBase = getInput('titleRegex', { required: true });
    const titleRegexFlags = getInput('titleRegexFlags', {
      required: true
    });
    const ticketLink = getInput('ticketLink', { required: false });
    const titleRegex = new RegExp(titleRegexBase, titleRegexFlags);
    const titleCheck = titleRegex.exec(title);

    // Instantiate a GitHub Client instance
    const token = getInput('token', { required: true });
    const client = getOctokit(token);
    const { owner, repo, number } = context.issue;
    const login = context.payload.pull_request?.user.login as string;
    const senderType = context.payload.pull_request?.user.type as string;
    const sender: string = senderType === 'Bot' ? login.replace('[bot]', '') : login;

    const linkTicket = async (matchArray: RegExpMatchArray): Promise<void> => {
      debug('match array for linkTicket', JSON.stringify(matchArray));
      debug('match array groups for linkTicket', JSON.stringify(matchArray.groups));

      if (!ticketLink) {
        return;
      }

      const ticketNumber = matchArray.groups?.ticketNumber;

      if (!ticketNumber) {
        debug('ticketNumber not found', 'ticketNumber group not found in match array.');

        return;
      }

      if (!ticketLink.includes('%ticketNumber%')) {
        debug('invalid ticketLink', 'ticketLink must include "%ticketNumber%" variable to post ticket link.');

        return;
      }

      const linkToTicket = ticketLink.replace('%ticketNumber%', ticketNumber);

      const currentReviews = await client.pulls.listReviews({
        owner,
        repo,
        pull_number: number
      });

      debug('current reviews', JSON.stringify(currentReviews));

      if (
        currentReviews?.data?.length &&
        currentReviews?.data.some((review: { body?: string }) => review?.body?.includes(linkToTicket))
      ) {
        debug('already posted ticketLink', 'found an existing review that contains the ticket link');

        return;
      }

      client.pulls.createReview({
        owner,
        repo,
        pull_number: number,
        body: `See the ticket for this pull request: ${linkToTicket}`,
        event: 'COMMENT'
      });
    };

    debug('title', title);

    // Return and approve if the title includes a Ticket ID
    if (titleCheck !== null) {
      debug('success', 'Title includes a ticket ID');
      await linkTicket(titleCheck);

      return;
    }

    const quiet = getInput('quiet', { required: false }) === 'true';

    // Exempt Users
    const exemptUsers = getInput('exemptUsers', { required: false })
      .split(',')
      .map(user => user.trim());

    // Debugging Entries
    debug('sender', sender);
    debug('sender type', senderType);
    debug('quiet mode', quiet.toString());
    debug('exempt users', exemptUsers.join(','));
    debug('ticket link', ticketLink);

    if (sender && exemptUsers.includes(sender)) {
      debug('success', 'User is listed as exempt');

      return;
    }

    // get the title format and ticket prefix
    const ticketPrefix = getInput('ticketPrefix');
    const titleFormat = getInput('titleFormat', { required: true });

    // Check for a ticket reference in the branch
    const branch: string = context.payload.pull_request?.head.ref;
    const branchRegexBase = getInput('branchRegex', { required: true });
    const branchRegexFlags = getInput('branchRegexFlags', {
      required: true
    });
    const branchRegex = new RegExp(branchRegexBase, branchRegexFlags);
    const branchCheck = branchRegex.exec(branch);

    if (branchCheck !== null) {
      debug('success', 'Branch name contains a reference to a ticket, updating title');

      const id = extractId(branch);

      if (id === null) {
        setFailed('Could not extract a ticket ID reference from the branch');

        return;
      }

      client.pulls.update({
        owner,
        repo,
        pull_number: number,
        title: titleFormat
          .replace('%prefix%', ticketPrefix)
          .replace('%id%', id)
          .replace('%title%', title)
      });

      if (!quiet) {
        client.pulls.createReview({
          owner,
          repo,
          pull_number: number,
          body:
            "Hey! I noticed that your PR contained a reference to the ticket in the branch name but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
          event: 'COMMENT'
        });
      }

      await linkTicket(branchCheck);

      return;
    }

    // Retrieve the pull request body and verify it's not empty
    const body = context?.payload?.pull_request?.body;

    if (body === undefined) {
      debug('failure', 'Body is undefined');
      setFailed('Could not retrieve the Pull Request body');

      return;
    }

    debug('body contents', body);

    // Check for a ticket reference number in the body
    const bodyRegexBase = getInput('bodyRegex', { required: true });
    const bodyRegexFlags = getInput('bodyRegexFlags', { required: true });
    const bodyRegex = new RegExp(bodyRegexBase, bodyRegexFlags);
    const bodyCheck = bodyRegex.exec(body);

    if (bodyCheck !== null) {
      debug('success', 'Body contains a reference to a ticket, updating title');

      const id = extractId(bodyCheck[0]);

      if (id === null) {
        setFailed('Could not extract a ticket shorthand reference from the body');

        return;
      }

      client.pulls.update({
        owner,
        repo,
        pull_number: number,
        title: titleFormat
          .replace('%prefix%', ticketPrefix)
          .replace('%id%', id)
          .replace('%title%', title)
      });

      if (!quiet) {
        client.pulls.createReview({
          owner,
          repo,
          pull_number: number,
          body:
            "Hey! I noticed that your PR contained a reference to the ticket in the body but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
          event: 'COMMENT'
        });
      }

      await linkTicket(bodyCheck);

      return;
    }

    // Last ditch effort, check for a ticket reference URL in the body
    const bodyURLRegexBase = getInput('bodyURLRegex', { required: false });

    if (!bodyURLRegexBase) {
      debug('failure', 'Title, branch, and body do not contain a reference to a ticket, and no body URL regex was set');
      setFailed('No ticket was referenced in this pull request');

      return;
    }

    const bodyURLRegexFlags = getInput('bodyURLRegexFlags', {
      required: true
    });
    const bodyURLRegex = new RegExp(bodyURLRegexBase, bodyURLRegexFlags);
    const bodyURLCheck = bodyURLRegex.exec(body);

    if (bodyURLCheck !== null) {
      debug('success', 'Body contains a ticket URL, updating title');

      const id = extractId(bodyURLCheck[0]);

      if (id === null) {
        setFailed('Could not extract a ticket URL from the body');

        return;
      }

      client.pulls.update({
        owner,
        repo,
        pull_number: number,
        title: titleFormat
          .replace('%prefix%', ticketPrefix)
          .replace('%id%', id)
          .replace('%title%', title)
      });

      if (!quiet) {
        client.pulls.createReview({
          owner,
          repo,
          pull_number: number,
          body:
            "Hey! I noticed that your PR contained a reference to the ticket URL in the body but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
          event: 'COMMENT'
        });
      }
    }

    if (titleCheck === null && branchCheck === null && bodyCheck === null && bodyURLCheck === null) {
      debug('failure', 'Title, branch, and body do not contain a reference to a ticket');
      setFailed('No ticket was referenced in this pull request');

      return;
    }
  } catch (error) {
    setFailed(error.message);
  }
}

run();
