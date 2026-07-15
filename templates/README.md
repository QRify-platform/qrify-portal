# {{SERVICE_NAME}}

{{DESCRIPTION}}

Scaffolded by **QRify Portal**.

## Local

See the stack-specific files in this repo (`package.json` or `requirements.txt`).

## Platform next steps

1. Add ECR repos `{{SERVICE_NAME}}-dev` / `{{SERVICE_NAME}}-prod` in `infra`
2. Allow this repo on the ECR push OIDC role (`infra/bootstrap`)
3. Add Helm values under `cluster-state/apps/{{SERVICE_NAME}}` and register in app-of-apps
4. Uncomment the `update-app-tag` step in `.github/workflows/release.dev.yaml`
5. Org vars: `AWS_ECR_ROLE_TO_ASSUME`, `AWS_ECR_REGISTRY`. Secret: `CLUSTER_STATE_PAT`
