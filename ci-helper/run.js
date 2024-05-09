import { EOL } from 'node:os';
import core from '@actions/core';
import exec from '@actions/exec';
import github from '@actions/github';

/**
 * Run function for the action
 */
async function run() {
  if (!process.env.OP_SERVICE_ACCOUNT_TOKEN) {
    core.setFailed('"OP_SERVICE_ACCOUNT_TOKEN" is required for op-secrets');
    return;
  }

  // Get inputs
  const secretsFile = core.getInput('secretsFile');
  core.info(`secretsFile: ${secretsFile}`);

  // Get commit message via REST client
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const { data } = await octokit.rest.repos.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: github.context.sha,
  });

  // Set skip deploy if commit message contains [skip deploy]
  // https://github.com/orgs/vercel/discussions/60#discussioncomment-114386
  // https://samanpavel.medium.com/github-actions-output-parameters-f7de80922712
  const commitMessage = data.commit.message;
  core.info(`Commit sha: ${data.sha}`);
  core.info(`Commit message: ${commitMessage}`);
  core.setOutput('skip_deploy', /\[skip deploy\]/i.test(commitMessage) ? '1' : '0');

  // Execute op-secrets command to get secrets
  const { stdout, stderr } = await exec.getExecOutput(`op-secrets --config ${secretsFile} env`, {
    silent: true,
  });

  if (stderr || stdout == undefined || stdout == '') {
    core.setFailed(stderr);
    return;
  }

  const envs = stdout.replace(/\n+$/g, '').split(EOL);
  for (const env of envs) {
    const [envName, ...secretValueParts] = env.split('=');
    // In case value contains more than one "="
    const secretValue = secretValueParts.join('=');

    // core.debug(`envName: ${envName}, secretValue: ${secretValue}`);
    core.setSecret(secretValue);
    core.exportVariable(envName, secretValue);
  }
}

run();
