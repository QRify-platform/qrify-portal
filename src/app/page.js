import CreateServiceForm from './components/CreateServiceForm';

export default function Home() {
  return (
    <main className="bg-bone">
      <section className="relative overflow-hidden">
        <div className="grid min-h-[100svh] lg:grid-cols-2">
          {/* Brand plane */}
          <div className="hero-paper relative flex flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
            <div className="pointer-events-none absolute inset-0 grain opacity-50" />

            <header className="relative z-10 flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
                Internal
              </p>
            </header>

            <div className="relative z-10 flex flex-1 flex-col justify-center py-16 lg:py-10">
              <h1 className="animate-rise font-display text-[clamp(4rem,13vw,7rem)] font-extrabold leading-[0.85] tracking-[-0.05em] text-soot">
                QRify
              </h1>
              <p className="animate-rise-2 mt-6 font-display text-[clamp(1.6rem,3.2vw,2.35rem)] font-medium leading-[1.1] tracking-[-0.03em] text-soot">
                Portal
              </p>
              <p className="animate-rise-3 mt-5 max-w-[34ch] text-base leading-relaxed text-steel sm:text-lg">
                Scaffold a service repo and stay on the same GitOps path as the
                rest of the platform.
              </p>

              <div className="animate-rise-4 mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-soot/10 pt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-steel">
                <span>
                  <span className="text-acid">01</span> Scaffold
                </span>
                <span>
                  <span className="text-acid">02</span> Ship
                </span>
                <span>
                  <span className="text-acid">03</span> Sync
                </span>
              </div>
            </div>
          </div>

          {/* Form plane — flush in soot, not a nested card */}
          <div className="relative flex flex-col bg-soot text-bone">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(#00f0c8 1px, transparent 1px), linear-gradient(90deg, #00f0c8 1px, transparent 1px)',
                backgroundSize: '52px 52px',
              }}
            />
            <div
              className="absolute left-0 top-0 hidden h-full w-1.5 bg-acid lg:block"
              aria-hidden
            />

            <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:px-12 xl:px-14">
              <p className="animate-rise font-mono text-[11px] uppercase tracking-[0.2em] text-acid">
                New service
              </p>
              <h2 className="animate-rise-2 mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tracking-[-0.03em]">
                Create from template
              </h2>
              <div className="animate-rise-3 mt-10 max-w-md">
                <CreateServiceForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
