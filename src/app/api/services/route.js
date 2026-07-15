import { NextResponse } from 'next/server';

const NAME_RE = /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/;
const STACKS = new Set(['nodejs', 'python']);

export async function POST(request) {
  const token = process.env.GITHUB_TOKEN || process.env.SCAFFOLD_GITHUB_TOKEN;
  const org = process.env.GITHUB_ORG || 'QRify-platform';
  const scaffoldRepo =
    process.env.SCAFFOLD_REPO || `${org}/portal`;
  const workflow =
    process.env.SCAFFOLD_WORKFLOW || 'scaffold-service.yaml';

  if (!token) {
    return NextResponse.json(
      {
        error:
          'Server is missing GITHUB_TOKEN (PAT with actions:write + repo create).',
      },
      { status: 503 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = String(body.name || '')
    .trim()
    .toLowerCase();
  const stack = String(body.stack || '').trim();
  const description = String(body.description || '').trim();

  if (!NAME_RE.test(name)) {
    return NextResponse.json(
      { error: 'Invalid service name. Use kebab-case (3–40 chars).' },
      { status: 400 },
    );
  }

  if (!STACKS.has(stack)) {
    return NextResponse.json(
      { error: 'Stack must be nodejs or python.' },
      { status: 400 },
    );
  }

  const reserved = new Set([
    'portal',
    'infra',
    'cluster-state',
    'github-actions',
    'helm-charts',
    'sealed-secrets',
    'qrify-web',
    'qrify-web-api',
  ]);
  if (reserved.has(name)) {
    return NextResponse.json(
      { error: `Name "${name}" is reserved by the platform.` },
      { status: 409 },
    );
  }

  const dispatchUrl = `https://api.github.com/repos/${scaffoldRepo}/actions/workflows/${workflow}/dispatches`;
  const dispatchRes = await fetch(dispatchUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        name,
        stack,
        description,
      },
    }),
  });

  if (!dispatchRes.ok) {
    const text = await dispatchRes.text();
    return NextResponse.json(
      {
        error: `Failed to dispatch scaffold workflow (${dispatchRes.status}). ${text.slice(0, 280)}`,
      },
      { status: 502 },
    );
  }

  // Best-effort: resolve newest run for a useful link (workflow_dispatch returns 204).
  let runUrl = `https://github.com/${scaffoldRepo}/actions/workflows/${workflow}`;
  try {
    await new Promise((r) => setTimeout(r, 2500));
    const runsRes = await fetch(
      `https://api.github.com/repos/${scaffoldRepo}/actions/workflows/${workflow}/runs?per_page=1&event=workflow_dispatch`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        cache: 'no-store',
      },
    );
    if (runsRes.ok) {
      const runs = await runsRes.json();
      const run = runs.workflow_runs?.[0];
      if (run?.html_url) runUrl = run.html_url;
    }
  } catch {
    // keep workflow list URL
  }

  return NextResponse.json({
    name,
    stack,
    repository: `${org}/${name}`,
    repoUrl: `https://github.com/${org}/${name}`,
    runUrl,
  });
}
