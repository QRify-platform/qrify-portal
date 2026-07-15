'use client';

import { useState } from 'react';

const STACKS = [
  {
    id: 'nodejs',
    label: 'Node.js',
    blurb: 'Express API with health, Docker, and release workflows.',
  },
  {
    id: 'python',
    label: 'Python',
    blurb: 'FastAPI service with health, Docker, and release workflows.',
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
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="service-name"
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel"
        >
          Service name
        </label>
        <div className="mt-3 flex items-baseline gap-2 border-b border-soot/15 pb-2 focus-within:border-acid">
          <span className="font-mono text-sm text-steel">QRify-platform/</span>
          <input
            id="service-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="payments-api"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-display text-2xl font-semibold tracking-[-0.03em] text-soot outline-none placeholder:text-soot/25 sm:text-3xl"
          />
        </div>
      </div>

      <fieldset>
        <legend className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
          Stack
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {STACKS.map((option) => {
            const selected = stack === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setStack(option.id)}
                className={`border px-5 py-4 text-left transition-colors ${
                  selected
                    ? 'border-soot bg-soot text-bone'
                    : 'border-soot/15 bg-white/50 text-soot hover:border-soot/40'
                }`}
              >
                <span className="font-display text-lg font-semibold tracking-[-0.02em]">
                  {option.label}
                </span>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    selected ? 'text-bone/70' : 'text-steel'
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
          className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel"
        >
          Description <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What does this service do?"
          className="mt-3 w-full resize-none border border-soot/15 bg-white/60 px-4 py-3 text-base text-soot outline-none transition-colors placeholder:text-soot/30 focus:border-acid"
        />
      </div>

      {error ? (
        <p className="border border-soot/20 bg-white px-4 py-3 text-sm text-soot">
          {error}
        </p>
      ) : null}

      {status === 'done' && result ? (
        <div className="animate-rise border border-acid/40 bg-soot px-5 py-5 text-bone">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-acid">
            Scaffolding started
          </p>
          <p className="mt-3 font-display text-xl font-semibold tracking-[-0.02em]">
            {result.repository}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-bone/70">
            GitHub Actions is creating the repo from the {result.stack} template.
            Watch the run, then add ECR + cluster-state when you are ready to deploy.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            {result.runUrl ? (
              <a
                href={result.runUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-acid underline-offset-4 hover:underline"
              >
                Open workflow run
              </a>
            ) : null}
            {result.repoUrl ? (
              <a
                href={result.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone/70 underline-offset-4 hover:text-bone hover:underline"
              >
                Open repository
              </a>
            ) : null}
          </div>
        </div>
      ) : (
        <button
          type="submit"
          disabled={status === 'creating'}
          className="group inline-flex items-center gap-3 bg-soot px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-bone transition-colors hover:bg-acid hover:text-soot disabled:cursor-wait disabled:opacity-70"
        >
          {status === 'creating' ? 'Creating service' : 'Create service'}
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
