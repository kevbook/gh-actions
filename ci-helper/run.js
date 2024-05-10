import { EOL } from 'node:os';
import core from '@actions/core';
import github from '@actions/github';
import process from 'node:process';
import util from 'node:util';
import { exec as execNonPromise } from 'child_process';

// Nodejs exec with await
// Note: We don't use github actions exec because it prints the output
// https://gist.github.com/miguelmota/e8fda506b764671745852c940cac4adb
const exec = util.promisify(execNonPromise);

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

  // Set ref SHA - pull request head sha or commit sha
  const sha = github.context.payload.pull_request?.head?.sha || github.context.sha;
  const shortSha = sha.slice(0, 7);
  core.info(`SHA: ${sha}`);
  core.setOutput('short_sha', shortSha);

  // Get commit message via REST client
  const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
  const { data } = await octokit.rest.repos.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: sha,
  });

  // Set skip deploy if commit message contains [skip deploy]
  // https://github.com/orgs/vercel/discussions/60#discussioncomment-114386
  // https://samanpavel.medium.com/github-actions-output-parameters-f7de80922712
  const commitMessage = data.commit.message;
  core.info(`Commit message: ${commitMessage}`);
  core.setOutput('skip_deploy', /\[skip deploy\]/i.test(commitMessage) ? '1' : '0');

  // Execute op-secrets command to get secrets
  const { stdout, stderr } = await exec(`op-secrets --config ${secretsFile} env`);

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
