# gh-actions

You must enable workflow permissions on the organization level

> <img alt="image" width="800" src="https://github.com/pricelastic/gh-actions/assets/926720/faea32df-cf14-4435-9e27-2686836115f0">

## Development and Local Testing

1. [VSCode Plugin](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions)
2. Update `.secrets` file with your GitHub token
3. [Act](https://github.com/nektos/act) to test Github Actions locally
   - Docker issue: https://github.com/nektos/act/issues/2239#issuecomment-1979819940

```shell
# Test the action locally using act
$ act --workflows=./tests/create-promotion-pr.yml \
    --eventpath=tests/pr-merged.json
```

## 1. Create Promotion PR

Automatically creates pull requests for promoting changes from staging to the production branch.

- Uses GitHub CLI to create a pull request
- Add a workflow file `.github/workflows/promotion-pr.yml` in your repository

```yaml
name: Automatic PRs for main ⮕ prod
on:
  pull_request:
    branches: [main]
    types: [closed]
jobs:
  Create-Prod-Promotion-PR:
    runs-on: ubuntu-latest
    # Action uses GitHub CLI requiring the below permissions
    permissions:
      pull-requests: write
      contents: write
      repository-projects: read
    steps:
      - uses: pricelastic/gh-actions/create-promotion-pr@main
        with:
          stagingBranch: main
          prodBranch: prod
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
