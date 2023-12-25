# gh-actions

## 1. Create Promotion PR

Automatically creates pull requests for promoting changes from staging to production branch.

- Uses GitHub CLI to create a pull request
- Add a workflow file `.github/workflows/promotion-pr.yml` in your repository

```yaml
name: Automatic PRs for staging ⮕ prod
on:
  pull_request:
    branches: [main]
    types: [closed]
jobs:
  Create-Prod-Promotion-PR:
    uses: pricelastic/gh-actions/create-promotion-pr@main
    with:
      stagingBranch: main
      prodBranch: prod
      repoName: ${{ github.event.repository.full_name }}
    env:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
