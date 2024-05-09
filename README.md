# gh-actions

You must enable workflow permissions on the organization level

> <img alt="image" width="800" src="https://github.com/pricelastic/gh-actions/assets/926720/faea32df-cf14-4435-9e27-2686836115f0">

## Development and Local Testing

Tooling for MacOS/Linux: https://github.com/pricelastic/infra

```shell
# Install dependencies
$ pnpm install

# Run prettier
$ pnpm run format

# Start the local server
# From each action's directory, eg. "create-promotion-pr" directory
$ pnpm install && pnpm run dev

# Create a production build before merging
# From each action's directory, eg. "create-promotion-pr" directory
$ pnpm run build

# Test the action locally using act (from this directory)
$ act --secret GITHUB_TOKEN \
    --workflows=./tests/create-promotion-pr.yml push

$ act --secret GITHUB_TOKEN \
    --secret OP_SERVICE_ACCOUNT_TOKEN \
    --workflows=./tests/ci-helper.yml pull_request
```

## 1. Create Promotion PR

Automatically creates pull requests for promoting changes from staging to the production branch.

- Uses [GitHub ToolKit](https://github.com/actions/toolkit)
- Add the below workflow file `.github/workflows/promotion-pr.yml` in your repository

```yaml
# .github/workflows/promotion-pr.yml
name: Automatic PRs for main ⮕ prod
on:
  # On push to main branch (including PR closed)
  push:
    branches: [main]
jobs:
  create-prod-promotion-pr:
    runs-on: ubuntu-latest
    steps:
      - uses: pricelastic/gh-actions/create-promotion-pr@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          stagingBranch: main
          prodBranch: prod
```

---

## References

1. https://github.com/actions/toolkit
2. https://github.com/sdras/awesome-actions
3. https://github.com/actions/javascript-action
4. https://github.com/docker/build-push-action
5. https://github.com/softprops/action-gh-release
