import * as core from "@actions/core";
import * as github from "@actions/github";

// Helper function to retrieve digits from a string (be it a ticket string or a full URL)
const extractId = (value: string) => {
  const result = value.match(/\d+/);

  if (result !== null) {
    return result[0];
  }

  return null;
};

async function run() {
  try {
    core.debug("Inside try block");

    // Check for a Clubhouse Ticket Reference in the Title
    const title: string = github.context?.payload?.pull_request?.title;
    const titleRegexBase = core.getInput("titleRegex", { required: true });
    const titleRegexFlags = core.getInput("titleRegexFlags", {
      required: true
    });
    const titleRegex = new RegExp(titleRegexBase, titleRegexFlags);
    const titleCheck = title.match(titleRegex);

    // Return and approve if the title includes a Ticket ID
    if (titleCheck !== null) {
      core.debug("Title includes a ticket ID.");
      core.debug("Exiting...");
      return;
    } else {
      core.debug("Title does not include a ticket ID.");
      core.debug("Continuing...");
    }

    core.debug(title);

    // Retrieve the Pull Request body contents and verify it's not empty
    const body = github.context?.payload?.pull_request?.body;
    if (body === undefined) {
      core.debug("Body is undefined.");
      core.setFailed("Could not retrieve the Pull Request body");
      core.debug("Exiting...");
      return;
    } else {
      core.debug("Body contains content.");
      core.debug("Continuing...");
    }

    // Instantiate a GitHub Client Instance
    const token = core.getInput("token", { required: true });
    const client = new github.GitHub(token);
    const pullRequest = github.context.issue;

    core.debug("Connected to GitHub Client.");
    core.debug("Continuing...");

    // Check for a Clubhouse Ticket Reference Number found in the body
    const bodyRegexBase = core.getInput("bodyRegex", { required: true });
    const bodyRegexFlags = core.getInput("bodyRegexFlags", { required: true });
    const bodyCheck = body.match(new RegExp(bodyRegexBase, bodyRegexFlags));

    // Load in the requested title format and ticket prefix
    const ticketPrefix = core.getInput("ticketPrefix", { required: true });
    const titleFormat = core.getInput("titleFormat", { required: true });

    if (bodyCheck !== null) {
      core.debug("Body contains a reference to a ticket.");
      core.debug(`Updating the title`);

      const id = extractId(bodyCheck[0]);

      if (id === null) {
        core.setFailed("Count not extract a Ticket ID from the body");
        return;
      }

      client.pulls.update({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        number: pullRequest.number,
        title: titleFormat
          .replace("%prefix%", ticketPrefix)
          .replace("%id%", id)
          .replace("%title%", title)
      });

      client.pulls.createReview({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        body:
          "Hey! I noticed that your PR contained a reference to the ticket in the body but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
        event: "COMMENT"
      });
      return;
    } else {
      core.debug("Body does NOT contain a reference to a ticket.");
      core.debug("Continuing...");
    }

    // Last Ditch Effort
    // Check for a Clubhouse Ticket Reference URL linked in the body
    const bodyURLRegexBase = core.getInput("bodyURLRegex", { required: true });
    const bodyURLRegexFlags = core.getInput("bodyURLRegexFlags", {
      required: true
    });
    const bodyURLRegex = new RegExp(bodyURLRegexBase, bodyURLRegexFlags);
    const bodyURLCheck = body.match(bodyURLRegex);

    if (bodyURLCheck !== null) {
      core.debug("This Pull Request body contains a URL to a ticket.");
      core.debug(`Updating the Pull Request title`);

      const id = extractId(bodyURLCheck[0]);

      if (id === null) {
        core.setFailed("Count not extract a Ticket ID from the body");
        return;
      }

      client.pulls.update({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        number: pullRequest.number,
        title: titleFormat
          .replace("%prefix%", ticketPrefix)
          .replace("%id%", id)
          .replace("%title%", title)
      });

      client.pulls.createReview({
        owner: pullRequest.owner,
        repo: pullRequest.repo,
        pull_number: pullRequest.number,
        body:
          "Hey! I noticed that your PR contained a reference to the ticket URL in the body but not in the title. I went ahead and updated that for you. Hope you don't mind! ☺️",
        event: "COMMENT"
      });
    } else {
      core.debug("Body does NOT contain a URL to a ticket.");
      core.debug("Continuing...");
    }

    core.debug(body);

    if (titleCheck === null && bodyCheck === null && bodyURLCheck === null) {
      core.debug("Body does NOT contain a any reference to a ticket.");
      core.setFailed("No ticket was referenced in this pull request.");
      core.debug("Exiting...");
      return;
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
