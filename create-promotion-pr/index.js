import core from '@actions/core';
import github from '@actions/github';

/**
 * Run function for the action
 */
async function run() {
  // Get inputs
  const stagingBranch = core.getInput('stagingBranch');
  const prodBranch = core.getInput('prodBranch');

  core.info(`Staging branch: ${stagingBranch}`);
  core.info(`Production branch: ${prodBranch}`);
  core.info(`eventName: ${github.context.eventName}`);

  // Only allow to run on push to staging branch
  if (!github.context.ref.endsWith(stagingBranch)) {
    core.info(`github.context.ref: ${github.context.ref}`);
    core.setFailed('Action did not meet criteria to run (push to staging branch)');
    return;
  }

  // Repo context
  const { owner, repo } = github.context.repo;
  core.info(`Owner: ${owner}`);
  core.info(`Repo: ${repo}`);

  // Rest client instance
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

  // Check for existing promotion PR (prod branch)
  let prId;
  const { data: prs } = await octokit.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    base: prodBranch,
  });

  // Create prod PR if none exists
  if (prs?.length) {
    prId = prs[0].number;
    core.info(`Prod promotion PR exists: #${prId}`);
  } else {
    // Pull the oldest commit on the staging branch
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      sha: stagingBranch,
      per_page: 100,
    });

    // Create prod branch if it doesn't exist (from oldest commit on staging)
    try {
      // Fail safely if branch already exists
      const { data: createdBranch } = await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${prodBranch}`,
        sha: commits.pop().sha, // Last item
      });
      core.info(`"${prodBranch}" branch created: #${createdBranch.ref}`);
    } catch (e) {}

    // Create prod PR
    const { data: createdPR } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: `🚀 ${stagingBranch} ⮕ ${prodBranch}`,
      head: stagingBranch,
      base: prodBranch,
    });
    prId = createdPR.number;
    core.info(`Prod promotion PR created: #${prId}`);
  }

  // Get commits for the PR
  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: prId,
  });
  // core.debug(`Commits: ${JSON.stringify(commits)}`);

  // Build PR body, format: "- {parent.id}: {message} @{author}"
  const commentsArr = commits.map(function (i) {
    // Convert multiline message to single line
    const message = i.commit.message.replace(/\t+/g, '').replace(/(\r?\n)+/g, '. ');
    return `- ${i.parents[0]?.sha}: ${message} @${i.author.login}`;
  });
  // Add title H2
  commentsArr.unshift('## Prod Promotion PRs\n');

  await octokit.rest.pulls.update({
    owner,
    repo,
    pull_number: prId,
    body: commentsArr.join('\n'),
  });
  core.info(`Prod promotion PR body updated: #${prId}`);
}

run();
