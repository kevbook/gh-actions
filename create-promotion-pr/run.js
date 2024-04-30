import github from '@actions/github';
import core from '@actions/core';

/**
 * Run function for the action
 */
async function run() {
  // try {
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
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const graphql = octokit.graphql; // GraphQL client

  // Check for existing promotion PR (prod branch)
  const { prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    head: `${owner}:${prodBranch}`,
  });

  // Create prod PR if none exists
  console.log(prs);
  if (prs?.length) {
    core.info(`Prod promotion PR exists: #${prs.data[0].number}`);
  } else {
    // Create prod branch if it doesn't exist (from oldest commit in staging)
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: stagingBranch,
      per_page: 100,
    });

    try {
      // Fail safely if branch already exists
      const createdBranch = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${prodBranch}`,
        sha: commits.pop().sha, // Last item
      });
      core.info(`"${prodBranch}" branch created: #${createdBranch.number}`);
    } catch (e) {}

    // Create prod PR
    const { data: createdPR } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `🚀 ${stagingBranch} ⮕ ${prodBranch}`,
      head: stagingBranch,
      base: prodBranch,
      body: '## Prod Promotion PRs\n',
    });
    core.info(`Prod promotion PR created: #${createdPR.number}`);
  }

  // } catch (error) {
  //   console.log(JSON.stringify(error));
  //   // Fail the workflow run if an error occurs
  //   if (error instanceof Error) core.setFailed(error.message);
  // }
}

run();
