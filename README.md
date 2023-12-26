# gh-actions

You must enable workflow permissions on the organization level and then on the repository level.

> <img alt="image" width="800" src="https://github.com/pricelastic/gh-actions/assets/926720/faea32df-cf14-4435-9e27-2686836115f0">

---

## 1. Create Promotion PR

Automatically creates pull requests for promoting changes from staging to the production branch.

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
    runs-on: ubuntu-latest
    permissions:
      pull-requests: write
      contents: write
      repository-projects: read
    steps:
      - uses: pricelastic/gh-actions/create-promotion-pr@main
        with:
          stagingBranch: main
          prodBranch: prod
          repoName: ${{ github.event.repository.full_name }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
