import CreateServiceForm from './components/CreateServiceForm';

const pipeline = [
  { n: '01', title: 'Scaffold', body: 'New GitHub repo from a Node or Python template.' },
  { n: '02', title: 'Ship', body: 'Release workflows push to ECR and bump GitOps tags.' },
  { n: '03', title: 'Sync', body: 'Argo CD deploys through the same app-of-apps path.' },
];

export default function Home() {
  return (
    <main className="portal-atmosphere relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grain" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <p className="font-display text-xl font-bold tracking-[-0.04em] text-soot sm:text-2xl">
          QRify
        </p>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
          Internal portal
        </p>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-10">
        <div className="max-w-xl">
          <h1 className="animate-rise font-display text-[clamp(3.4rem,10vw,5.5rem)] font-extrabold leading-[0.9] tracking-[-0.05em] text-soot">
            Portal
          </h1>
          <p className="animate-rise-2 mt-6 max-w-[28ch] font-display text-[clamp(1.35rem,3vw,1.85rem)] font-medium leading-[1.15] tracking-[-0.025em] text-soot">
            Spin up a service on the QRify platform.
          </p>
          <p className="animate-rise-3 mt-5 max-w-[36ch] text-base leading-relaxed text-steel sm:text-lg">
            Name it, pick a stack, and kick the scaffold workflow. Same GitOps
            path as qrify-web — without hand-rolling the boilerplate.
          </p>

          <ol className="animate-rise-3 mt-12 space-y-5 border-t border-soot/10 pt-8">
            {pipeline.map((step) => (
              <li key={step.n} className="grid grid-cols-[3rem_1fr] gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-acid">
                  {step.n}
                </span>
                <div>
                  <p className="font-display text-lg font-semibold tracking-[-0.02em] text-soot">
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-steel">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="animate-rise-2 border border-soot/10 bg-white/70 p-6 shadow-[0_24px_80px_rgba(7,8,11,0.06)] backdrop-blur-sm sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-steel">
            New service
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-soot">
            Create from template
          </h2>
          <div className="mt-8">
            <CreateServiceForm />
          </div>
        </div>
      </section>
    </main>
  );
}
