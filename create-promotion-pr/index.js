// module.exports = async ({ github, context, core }) => {
//   const { SHA } = process.env;
//   const commit = await github.rest.repos.getCommit({
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
  const openPRs = await github.rest.pulls.get({ owner, repo, state: "open" });

  console.log(
    "====>>>>",
    owner,
    repo,
    core.getInput,
    core.getInput("stagingBranch"),
    openPRs
  );
};
