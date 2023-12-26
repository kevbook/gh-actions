# Script arguments
REPO_NAME=$1
STAGING_BRANCH=$2
PROD_BRANCH=$3

# Templates
PR_TITLE="🚀 $STAGING_BRANCH ⮕ $PROD_BRANCH"
PR_BODY="## Prod Promotion PRs
"

# Check for existing promotion PR
PROMOTION_PR=$(gh pr list --state=open \
  --repo=$REPO_NAME --base=$PROD_BRANCH \
  --json number --jq '. | sort_by(.updatedAt) | reverse | .[0].number')

# Create a promotion PR if none exists
if [ -z "$PROMOTION_PR" ]; then
  PROMOTION_PR=$(gh pr create --repo=$REPO_NAME \
    --base=$PROD_BRANCH --head=$STAGING_BRANCH \
    --title="$PR_TITLE" --body="$PR_BODY")

  echo "PROMOTION_PR created: $PROMOTION_PR"
else
  echo "PROMOTION_PR exists: $PROMOTION_PR"
fi

# Pull all the staging PRs
STAGING_PRS=$(gh pr list --state=open --repo=$REPO_NAME \
  --base=$STAGING_BRANCH \
  --json number,title,updatedAt,author \
  --jq 'sort_by(.updatedAt) | reverse | .[] | "- #\(.number): \(.title) @\(.author.login)"')

# Update the promotion PR
gh pr edit $PROMOTION_PR --repo=$REPO_NAME --title="$PR_TITLE" --body="$PR_BODY$STAGING_PRS"
