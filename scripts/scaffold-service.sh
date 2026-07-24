#!/usr/bin/env bash
# Provision a new QRify service end-to-end:
#   1) ECR {name}-dev / {name}-prod
#   2) GitHub app repo from templates/{stack}
#   3) cluster-state Helm chart + app-of-apps entries
set -euo pipefail

ORG="${ORG:-QRify-platform}"
NAME="${NAME:?NAME is required}"
STACK="${STACK:?STACK is required}"
DESCRIPTION="${DESCRIPTION:-}"
AWS_REGION="${AWS_REGION:-us-east-2}"
GH_TOKEN="${GH_TOKEN:?GH_TOKEN is required}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GIT_EMAIL="${GIT_EMAIL:-portal-bot@qrify-web.com}"
GIT_NAME="${GIT_NAME:-QRify Portal}"

# --- validation -------------------------------------------------------------

if [[ ! "$NAME" =~ ^[a-z][a-z0-9-]{1,38}[a-z0-9]$ ]]; then
  echo "::error::Invalid name '${NAME}' (kebab-case, 3–40 chars)"
  exit 1
fi

case "$STACK" in
  nodejs)
    SERVICE_PORT=3000
    HEALTH_PATH=/health
    ;;
  python)
    SERVICE_PORT=8000
    HEALTH_PATH=/health
    ;;
  *)
    echo "::error::Invalid stack '${STACK}' (expected nodejs|python)"
    exit 1
    ;;
esac

if [ -z "$DESCRIPTION" ]; then
  DESCRIPTION="Service scaffolded by QRify Portal (${STACK})"
fi

# Escape for sed replacement on the right-hand side.
escape_sed() {
  printf '%s' "$1" | sed -e 's/[&/\]/\\&/g'
}

DESC_ESCAPED="$(escape_sed "$DESCRIPTION")"

replace_placeholders() {
  local root="$1"
  while IFS= read -r -d '' file; do
    sed -i \
      -e "s/{{SERVICE_NAME}}/${NAME}/g" \
      -e "s/{{DESCRIPTION}}/${DESC_ESCAPED}/g" \
      -e "s/{{SERVICE_PORT}}/${SERVICE_PORT}/g" \
      -e "s|{{HEALTH_PATH}}|${HEALTH_PATH}|g" \
      "$file"
  done < <(find "$root" -type f -print0)
}

git_identity() {
  git config user.email "$GIT_EMAIL"
  git config user.name "$GIT_NAME"
}

# --- ECR --------------------------------------------------------------------

ensure_ecr() {
  local repo="$1"
  if aws ecr describe-repositories --repository-names "$repo" --region "$AWS_REGION" >/dev/null 2>&1; then
    echo "ECR exists: ${repo}"
    return 0
  fi
  echo "Creating ECR: ${repo}"
  aws ecr create-repository \
    --repository-name "$repo" \
    --region "$AWS_REGION" \
    --image-scanning-configuration scanOnPush=true \
    --tags Key=Project,Value=QRify Key=ManagedBy,Value=QRifyPortal >/dev/null
}

ensure_ecr "${NAME}-dev"
ensure_ecr "${NAME}-prod"

# --- GitHub production environment (required reviewers) ---------------------
# New app repos get environment "production" with required reviewers so
# release.yaml promote-prod waits for approval. Override via org vars:
#   PROD_REVIEWER_LOGIN  — GitHub username (default: token user / bryanpow)
#   PROD_REVIEWER_TEAM   — org team slug (optional; used instead of user if set)

ensure_production_environment() {
  local reviewer_json reviewer_id login team_slug

  team_slug="${PROD_REVIEWER_TEAM:-}"
  if [ -n "$team_slug" ]; then
    reviewer_id="$(gh api "/orgs/${ORG}/teams/${team_slug}" --jq .id)"
    reviewer_json="$(printf '{"type":"Team","id":%s}' "$reviewer_id")"
    echo "production reviewers: team ${ORG}/${team_slug} (${reviewer_id})"
  else
    login="${PROD_REVIEWER_LOGIN:-}"
    if [ -z "$login" ]; then
      login="$(gh api user --jq .login)"
    fi
    reviewer_id="$(gh api "/users/${login}" --jq .id)"
    reviewer_json="$(printf '{"type":"User","id":%s}' "$reviewer_id")"
    echo "production reviewers: user ${login} (${reviewer_id})"
  fi

  gh api --method PUT \
    "/repos/${ORG}/${NAME}/environments/production" \
    --input - >/dev/null <<EOF
{
  "prevent_self_review": false,
  "reviewers": [${reviewer_json}]
}
EOF
  echo "Configured ${ORG}/${NAME} environment production with required reviewers"
}

# --- GitHub app repo --------------------------------------------------------

create_app_repo() {
  local work
  work="$(mktemp -d)"

  cp -R "${ROOT}/templates/${STACK}/." "$work/"
  cp "${ROOT}/templates/README.md" "$work/README.md"
  replace_placeholders "$work"

  if gh repo view "${ORG}/${NAME}" >/dev/null 2>&1; then
    echo "Repo ${ORG}/${NAME} already exists — skipping create/push"
    rm -rf "$work"
    return 0
  fi

  echo "Creating ${ORG}/${NAME} ..."
  gh repo create "${ORG}/${NAME}" \
    --public \
    --description "$DESCRIPTION" \
    --disable-wiki

  (
    cd "$work"
    git init -b main
    git_identity
    git add .
    git commit -m "Scaffold ${NAME} (${STACK}) from QRify Portal"
    git remote add origin "https://x-access-token:${GH_TOKEN}@github.com/${ORG}/${NAME}.git"
    git push -u origin main
  )

  rm -rf "$work"
  echo "Created https://github.com/${ORG}/${NAME}"
}

create_app_repo
ensure_production_environment

# --- cluster-state GitOps ---------------------------------------------------

append_app_of_apps() {
  local values="$1"
  if grep -qE "^- name: ${NAME}\$" "$values"; then
    echo "app-of-apps already lists ${NAME}"
    return 0
  fi

  # Keep trailing newline + blank line between apps for readability.
  printf '\n' >>"$values"
  cat >>"$values" <<EOF
  - name: ${NAME}
    env: dev
    namespace: dev
    valuesFiles:
      - values.yaml
      - values.dev.yaml

  - name: ${NAME}
    env: prod
    namespace: prod
    valuesFiles:
      - values.yaml
      - values.prod.yaml
EOF
}

update_cluster_state() {
  local cs app_dir
  cs="$(mktemp -d)"

  git clone --depth 1 \
    "https://x-access-token:${GH_TOKEN}@github.com/${ORG}/cluster-state.git" \
    "$cs"

  app_dir="${cs}/apps/${NAME}"
  if [ -d "$app_dir" ]; then
    echo "cluster-state already has apps/${NAME} — leaving as-is"
    rm -rf "$cs"
    return 0
  fi

  mkdir -p "$app_dir"
  cp "${ROOT}/templates/gitops/Chart.yaml" "$app_dir/"
  cp "${ROOT}/templates/gitops/values.yaml" "$app_dir/"
  cp "${ROOT}/templates/gitops/values.dev.yaml" "$app_dir/"
  cp "${ROOT}/templates/gitops/values.prod.yaml" "$app_dir/"
  replace_placeholders "$app_dir"

  append_app_of_apps "${cs}/app-of-apps/values.yaml"

  (
    cd "$cs"
    git_identity
    git add "apps/${NAME}" app-of-apps/values.yaml
    git commit -m "Add ${NAME} app (scaffolded by QRify Portal)"
    git push origin HEAD:main
  )

  rm -rf "$cs"
  echo "Updated cluster-state apps/${NAME} + app-of-apps"
}

update_cluster_state

echo "::notice::Scaffold complete for ${ORG}/${NAME}. First Release Dev run will push an image and bump the GitOps tag."
