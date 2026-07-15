import { NextResponse } from 'next/server';

const NAME_RE = /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/;
const STACKS = new Set(['nodejs', 'python']);

const ghHeaders = (token) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
});

export async function POST(request) {
  const token = process.env.GITHUB_TOKEN || process.env.SCAFFOLD_GITHUB_TOKEN;
  const org = process.env.GITHUB_ORG || 'QRify-platform';
  const scaffoldRepo =
    process.env.SCAFFOLD_REPO || `${org}/qrify-portal`;
  const workflowFile =
    process.env.SCAFFOLD_WORKFLOW || 'scaffold-service.yaml';

  if (!token) {
    return NextResponse.json(
      {
        error:
          'Server is missing GITHUB_TOKEN (PAT with actions:write + repo create). Restart npm run dev after exporting it.',
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
    'qrify-portal',
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

  // Resolve the active scaffold workflow, then dispatch by file path (more
  // reliable than a stale workflow id after file rewrites).
  const listRes = await fetch(
    `https://api.github.com/repos/${scaffoldRepo}/actions/workflows?per_page=100`,
    { headers: ghHeaders(token), cache: 'no-store' },
  );
  if (!listRes.ok) {
    const text = await listRes.text();
    return NextResponse.json(
      {
        error: `Cannot list workflows on ${scaffoldRepo} (${listRes.status}). Check PAT: repo access to qrify-portal + Actions Read/Write. ${text.slice(0, 200)}`,
      },
      { status: 502 },
    );
  }

  const listed = await listRes.json();
  const match = (listed.workflows || []).find(
    (w) =>
      w.state === 'active' &&
      (w.path === `.github/workflows/${workflowFile}` ||
        w.path?.endsWith(`/${workflowFile}`)),
  );

  if (!match) {
    const names = (listed.workflows || [])
      .map((w) => `${w.path}[${w.state}]`)
      .join(', ');
    return NextResponse.json(
      {
        error: `Active workflow ${workflowFile} not found on ${scaffoldRepo}. Seen: ${names || '(none)'}. Push scaffold-service.yaml to main if missing.`,
      },
      { status: 502 },
    );
  }

  const workflowPath = encodeURIComponent(match.path);
  const dispatchRes = await fetch(
    `https://api.github.com/repos/${scaffoldRepo}/actions/workflows/${workflowPath}/dispatches`,
    {
      method: 'POST',
      headers: {
        ...ghHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          name,
          stack,
          description: description || '',
        },
      }),
    },
  );

  if (!dispatchRes.ok) {
    const text = await dispatchRes.text();
    return NextResponse.json(
      {
        error: `Failed to dispatch scaffold workflow (${dispatchRes.status}). ${text.slice(0, 280)}`,
      },
      { status: 502 },
    );
  }

  let runUrl = match.html_url || `https://github.com/${scaffoldRepo}/actions`;
  try {
    await new Promise((r) => setTimeout(r, 2500));
    const runsRes = await fetch(
      `https://api.github.com/repos/${scaffoldRepo}/actions/workflows/${match.id}/runs?per_page=1&event=workflow_dispatch`,
      { headers: ghHeaders(token), cache: 'no-store' },
    );
    if (runsRes.ok) {
      const runs = await runsRes.json();
      const run = runs.workflow_runs?.[0];
      if (run?.html_url) runUrl = run.html_url;
    }
  } catch {
    // keep workflow URL
  }

  return NextResponse.json({
    name,
    stack,
    repository: `${org}/${name}`,
    repoUrl: `https://github.com/${org}/${name}`,
    runUrl,
  });
}
