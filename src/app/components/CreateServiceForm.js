'use client';

import { useState } from 'react';

const STACKS = [
  {
    id: 'nodejs',
    label: 'Node.js',
    blurb: 'Express · Docker · release',
  },
  {
    id: 'python',
    label: 'Python',
    blurb: 'FastAPI · Docker · release',
  },
];

const NAME_RE = /^[a-z][a-z0-9-]{1,38}[a-z0-9]$/;

export default function CreateServiceForm() {
  const [name, setName] = useState('');
  const [stack, setStack] = useState('nodejs');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    const trimmed = name.trim().toLowerCase();
    if (!NAME_RE.test(trimmed)) {
      setError(
        'Use a lowercase kebab-case name (3–40 chars), e.g. payments-api.',
      );
      return;
    }

    setStatus('creating');
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          stack,
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create service');
      }
      setResult(data);
      setStatus('done');
    } catch (err) {
      setError(err.message || 'Something went wrong');
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <div>
        <label
          htmlFor="service-name"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/45"
        >
          Service name
        </label>
        <div className="field-ring mt-3 flex items-baseline gap-2 border border-bone/15 bg-bone/[0.04] px-3 py-3">
          <span className="shrink-0 font-mono text-xs text-bone/35">
            QRify-platform/
          </span>
          <input
            id="service-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="payments-api"
            autoComplete="off"
            spellCheck={false}
            className="w-full min-w-0 bg-transparent font-display text-xl font-semibold tracking-[-0.03em] text-bone outline-none placeholder:text-bone/25"
          />
        </div>
      </div>

      <fieldset>
        <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/45">
          Stack
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {STACKS.map((option) => {
            const selected = stack === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setStack(option.id)}
                className={`border px-4 py-3.5 text-left transition-colors duration-150 ${
                  selected
                    ? 'border-acid bg-acid text-soot'
                    : 'border-bone/15 text-bone hover:border-bone/35'
                }`}
              >
                <span className="font-display text-base font-semibold tracking-[-0.02em]">
                  {option.label}
                </span>
                <p
                  className={`mt-1 text-xs leading-snug ${
                    selected ? 'text-soot/65' : 'text-bone/40'
                  }`}
                >
                  {option.blurb}
                </p>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label
          htmlFor="description"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/45"
        >
          Description{' '}
          <span className="normal-case tracking-normal text-bone/30">
            (optional)
          </span>
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="What does this service do?"
          className="field-ring mt-3 w-full resize-none border border-bone/15 bg-bone/[0.04] px-3 py-3 text-sm text-bone outline-none placeholder:text-bone/25"
        />
      </div>

      {error ? (
        <p className="border border-acid/40 bg-bone/[0.04] px-3 py-2.5 text-sm text-bone">
          {error}
        </p>
      ) : null}

      {status === 'done' && result ? (
        <div className="animate-rise border border-acid/40 px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-acid">
            Scaffolding started
          </p>
          <p className="mt-2 font-display text-lg font-semibold tracking-[-0.02em]">
            {result.repository}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-bone/55">
            Actions is creating the {result.stack} template. Wire ECR +
            cluster-state when you&apos;re ready to deploy.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {result.runUrl ? (
              <a
                href={result.runUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-acid underline-offset-4 hover:underline"
              >
                Workflow run
              </a>
            ) : null}
            {result.repoUrl ? (
              <a
                href={result.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone/45 underline-offset-4 hover:text-bone hover:underline"
              >
                Repository
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="submit"
          disabled={status === 'creating'}
          className="group inline-flex w-full items-center justify-between gap-3 bg-bone px-6 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-soot transition-colors duration-150 hover:bg-acid disabled:cursor-wait disabled:opacity-70"
        >
          <span>
            {status === 'creating' ? 'Creating service…' : 'Create service'}
          </span>
          <span
            className={`h-2 w-2 bg-acid transition-colors group-hover:bg-soot ${
              status === 'creating' ? 'animate-pulsebar origin-left' : ''
            }`}
            aria-hidden
          />
        </button>
      )}
    </form>
  );
}
