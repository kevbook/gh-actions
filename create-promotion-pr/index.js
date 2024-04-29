// module.exports = async ({ github, context, core }) => {
//   const { SHA } = process.env;
//   const commit = await github.rest.repos.getCommit({
//     owner: context.repo.owner,
//     repo: context.repo.repo,
//     ref: `${SHA}`,
//   });
//   core.exportVariable("author", commit.data.commit.author.email);
// };

module.exports = async function ({ github, context, core }) {
  // Repo context
  const { owner, repo } = context.repo;

  // Get inputs
  const stagingBranch = core.getInput("stagingBranch");
  const prodBranch = core.getInput("prodBranch");

  // const graphql = github.graphql; // GraphQL client

  console.log(
    "====>>>>",
    owner,
    repo,
    core.getInput,
    core.getInput("stagingBranch")
  );
};
