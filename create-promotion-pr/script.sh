# Script arguments
REPO_NAME_FULL=$1
STAGING_BRANCH=$2
PROD_BRANCH=$3

# Splitting REPO_NAME into owner and repo
REPO_OWNER="${REPO_NAME_FULL%%/*}"
REPO_NAME="${REPO_NAME_FULL##*/}"

# Templates
PR_TITLE="🚀 $STAGING_BRANCH ⮕ $PROD_BRANCH"
PR_BODY="## Prod Promotion PRs
"

# Check for existing promotion PR
PROMOTION_PR=$(gh pr list --state=open \
  --repo=$REPO_NAME_FULL --base=$PROD_BRANCH \
  --json number --jq '. | sort_by(.updatedAt) | reverse | .[0].number')

# Create a promotion PR if none exists
if [ -z "$PROMOTION_PR" ]; then
  PROMOTION_PR=$(gh pr create --repo=$REPO_NAME_FULL \
    --base=$PROD_BRANCH --head=$STAGING_BRANCH \
    --title="$PR_TITLE" --body="$PR_BODY")

  echo "PROMOTION_PR created: $PROMOTION_PR"
else
  echo "PROMOTION_PR exists: $PROMOTION_PR"
fi

# Use graph API to pull all the commits for the PR
# Format: #pr: message @author 
STAGING_PRS=$(gh api graphql -f query="{
  repository(owner: \"${REPO_OWNER}\", name: \"${REPO_NAME}\") {
    pullRequest(number: 20) {
      title
      commits(first: 100) {
        nodes {
          commit {
            author {
              user {
                login
              }
            }
            message
            associatedPullRequests(first: 1) {
              nodes {
                number
              }
            }
          }
        }
      }
    }
  }
}" --jq '.data.repository.pullRequest.commits.nodes | map(select(.commit.associatedPullRequests.nodes | length > 0)) | map("- #\(.commit.associatedPullRequests.nodes[0].number): \(.commit.message) @\(.commit.author.user.login)") | .[]')

# Update the promotion PR
echo "STAGING_PRS: $STAGING_PRS"
gh pr edit $PROMOTION_PR --repo=$REPO_NAME_FULL --title="$PR_TITLE" --body="$PR_BODY$STAGING_PRS"
