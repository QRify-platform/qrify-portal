# QRify Portal

Internal developer portal for the QRify platform.

- **Host:** `portal.qrify-web.com`
- **Job:** create a new service repo (Node.js or Python) via GitHub Actions

## Local

```bash
npm install
npm run dev
```

Optional env for local create-service:

```bash
export GITHUB_TOKEN=ghp_...   # or SCAFFOLD_GITHUB_TOKEN
export GITHUB_ORG=QRify-platform
export SCAFFOLD_REPO=QRify-platform/qrify-portal
```

## Create-service flow

1. UI posts to `/api/services`
2. API dispatches `.github/workflows/scaffold-service.yaml`
3. Workflow runs `scripts/scaffold-service.sh`, which creates:
   - public `QRify-platform/<name>` from `templates/{nodejs,python}`
   - ECR `<name>-dev` / `<name>-prod`
   - `cluster-state` Helm app + app-of-apps entries
4. First push Release Dev builds the image and bumps `values.dev.yaml`

## GitHub Actions config

On the current GitHub org plan, **org variables only apply to public repos**.
Scaffold creates **public** repos so they can use:

| Org variable | Example |
|---|---|
| `AWS_ECR_ROLE_TO_ASSUME` | `arn:aws:iam::856096729725:role/QRifyECRPushRole` |
| `AWS_ECR_REGISTRY` | `856096729725.dkr.ecr.us-east-2.amazonaws.com` |

**Secrets** (actual credentials):

| Secret | Used by |
|---|---|
| `CLUSTER_STATE_PAT` | update-app-tag |
| `SCAFFOLD_GITHUB_TOKEN` | scaffold-service (create repos) |

Runtime (cluster) needs `GITHUB_TOKEN` / `SCAFFOLD_GITHUB_TOKEN` so the pod can dispatch scaffolds — store via secrets-manager (SOPS → Secrets Manager → External Secrets).

## Platform wiring

Infra + `cluster-state` register `qrify-portal` like the other apps (ECR, ACM SAN, Route53, Helm).
