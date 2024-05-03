# gh-actions

You must enable workflow permissions on the organization level

> <img alt="image" width="800" src="https://github.com/pricelastic/gh-actions/assets/926720/faea32df-cf14-4435-9e27-2686836115f0">

## Development and Local Testing

1. [VSCode Plugin](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions)
2. [Act](https://github.com/nektos/act) to test Github Actions locally
   - Docker issue: https://github.com/nektos/act/issues/2239#issuecomment-1979819940

```shell
# Test the action locally using act
$ act --secret GITHUB_TOKEN \
    --workflows=./tests/create-promotion-pr.yml push
```

## 1. Create Promotion PR

Automatically creates pull requests for promoting changes from staging to the production branch.

- Uses [GitHub ToolKit](https://github.com/actions/toolkit)
- Uses GitHub CLI to create a pull request
- Add the below workflow file `.github/workflows/promotion-pr.yml` in your repository

```shell
# Start the local server
$ pnpm run dev

# Create a production build before merging
$ pnpm run build
```

```yaml
# .github/workflows/promotion-pr.yml
name: Automatic PRs for main ⮕ prod
on:
  # On push to main branch (including PR closed)
  push:
    branches: [main]
jobs:
  Create-Prod-Promotion-PR:
    runs-on: ubuntu-latest
    # Action uses GitHub API requiring the below permissions
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

---

## References

1. https://github.com/actions/toolkit
2. https://github.com/sdras/awesome-actions
3. https://github.com/actions/javascript-action
4. https://github.com/docker/build-push-action
5. https://github.com/softprops/action-gh-release
