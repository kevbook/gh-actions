import github from '@actions/github';
import core from '@actions/core';

/**
 * Run function for the action
 */
async function run() {
  try {
    // Get inputs
    const stagingBranch = core.getInput('stagingBranch');
    const prodBranch = core.getInput('prodBranch');
    core.info(`Staging branch: ${stagingBranch}`);
    core.info(`Production branch: ${prodBranch}`);

    // Repo context
    const { owner, repo } = github.context.repo;
    core.info(`Owner: ${owner}`);
    core.info(`Repo: ${repo}`);

    // Rest client
    // const token = core.getInput('github-token', { required: true });
    const octokit = github.getOctokit({ auth: process.env.GITHUB_TOKEN });
    console.log('=====================================');
    console.log(`-${process.env.GITHUB_TOKEN}-------`);

    const result = await octokit.rest.users.getAuthenticated();
    console.log(result.headers);
    // const prs = await octokit.rest.pulls.list({ owner, repo, state: 'open', base: prodBranch });

    // console.log('=========================', prs);

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
    console.log(JSON.stringify(error));
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
