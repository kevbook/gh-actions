import github from "@actions/github";
import core from "@actions/core";

/**
 * Run function for the action
 */
async function run() {
  try {
    // Repo context
    const { owner, repo } = github.context.repo;

    // Get inputs
    const stagingBranch = core.getInput("stagingBranch");
    const prodBranch = core.getInput("prodBranch");

    console.log(
      "=========================",
      stagingBranch,
      prodBranch,
      owner,
      repo
    );

    // const octokit = github.getOctokit(myToken);
    // const context = github.context;

    // const { data: pullRequest } = await octokit.rest.pulls.get({
    //     owner: 'octokit',
    //     repo: 'rest.js',
    //     pull_number: 123,
    //     mediaType: {
    //       format: 'diff'
    //     }
    // });

    // // const graphql = github.graphql; // GraphQL client
    // const openPRs = await github.rest.pulls.get({ owner, repo });

    // console.log(
    //   "====>>>>",
    //   owner,
    //   repo,
    //   core.getInput,
    //   core.getInput("stagingBranch"),
    //   openPRs
    // );
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
