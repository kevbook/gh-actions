# gh-actions

You must enable workflow permissions on the organization level

> <img alt="image" width="800" src="https://github.com/pricelastic/gh-actions/assets/926720/faea32df-cf14-4435-9e27-2686836115f0">

## Development and Local Testing

Tooling for MacOS/Linux: https://github.com/pricelastic/infra

```shell
# Install dependencies & run prettier format
$ pnpm install
$ pnpm run format

# Start the local server
# From each action's directory, eg. "create-promotion-pr" directory
$ pnpm install && pnpm run dev

# Create a production build before merging
# From each action's directory, eg. "create-promotion-pr" directory
$ pnpm run build

# Test the action locally using act (from this directory)
$ act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest \
    --secret GITHUB_TOKEN \
    --workflows=./tests/create-promotion-pr.yml push

$ act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest \
    --secret GITHUB_TOKEN \
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
    # Action uses GitHub API requiring the below permissions
    permissions:
      contents: write
      pull-requests: write
      repository-projects: read
    steps:
      - uses: pricelastic/gh-actions/create-promotion-pr@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          stagingBranch: main
          prodBranch: prod
```

## 2. CI Helper & Docker Setup

```yaml
name: Continuous integration
on:
  pull_request:
    branches: [main] # $default-branch
    # opened: When a new PR is created
    # synchronize: When new commits are pushed to an existing PR
    # reopened: When a previously closed PR is reopened
    types: [opened, synchronize, reopened]

jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/${{ github.repository_owner }}/builder:latest
    outputs:
      SHORT_SHA: ${{ steps.ci-helper.outputs.short_sha }}
      SKIP_DEPLOY: ${{ steps.ci-helper.outputs.skip_deploy }}
    steps:
      - uses: actions/checkout@v4 # Checkout the code

      # CI-helper to load env vars (output: short_sha, skip_deploy)
      - id: ci-helper
        uses: pricelastic/gh-actions/ci-helper@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OP_SERVICE_ACCOUNT_TOKEN: ${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
        with:
          dotenvFile: .env.sample

      # Run prettier check & eslint and tests
      - run: pnpm install
      - run: pnpm run format:check
      - run: pnpm run lint
      - run: pnpm run test

  build:
    needs: test
    if: needs.test.outputs.SKIP_DEPLOY == '0'
    runs-on: ubuntu-latest
    permissions:
      packages: write
    steps:
      # - run: echo "🚀 Building docker image"
      - uses: actions/checkout@v4 # Checkout the code
      - uses: pricelastic/gh-actions/docker-setup@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          ghcrUsername: ${{ github.actor }}

      - uses: docker/build-push-action@v5
        with:
          context: .
          tags: ghcr.io/${{ github.repository }}:${{ needs.test.outputs.SHORT_SHA }}
          # platforms: linux/amd64,linux/arm64
          push: true
```

---

## References

1. https://github.com/actions/toolkit
2. https://github.com/sdras/awesome-actions
3. https://github.com/actions/javascript-action
4. https://github.com/docker/build-push-action
5. https://github.com/softprops/action-gh-release
