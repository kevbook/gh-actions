import { EOL } from 'node:os';
import core from '@actions/core';
import exec from '@actions/exec';

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

  // Set skip deploy if commit message contains [skip deploy]
  // https://github.com/orgs/vercel/discussions/60#discussioncomment-114386
  // https://samanpavel.medium.com/github-actions-output-parameters-f7de80922712
  const { stdout: gitMessage } = await exec.getExecOutput('git log -1 --pretty=oneline');
  core.setOutput('skip_deploy', /\[skip deploy\]/i.test(gitMessage) ? '1' : '0');

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
