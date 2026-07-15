# {{SERVICE_NAME}}

{{DESCRIPTION}}

Scaffolded by **QRify Portal**.

## What was provisioned

- Public GitHub repo with Docker + release workflows
- ECR repositories `{{SERVICE_NAME}}-dev` and `{{SERVICE_NAME}}-prod`
- `cluster-state` Helm chart under `apps/{{SERVICE_NAME}}` (dev + prod app-of-apps)

## Local

Node: `npm install && npm start`  
Python: `pip install -r requirements.txt && uvicorn app.main:app --reload`

## Secrets / vars

Uses org **variables** (public repos on free plan):

- `AWS_ECR_ROLE_TO_ASSUME`
- `AWS_ECR_REGISTRY`

Needs org **secret** `CLUSTER_STATE_PAT` (contents write on `cluster-state`) for image-tag updates.
