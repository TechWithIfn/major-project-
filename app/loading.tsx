export default function Loading() {
  const particles = [
    { size: 'h-1.5 w-1.5', x: 'left-[12%]', y: 'top-[18%]', delay: '0s', duration: '7s' },
    { size: 'h-1 w-1', x: 'left-[22%]', y: 'top-[72%]', delay: '1.2s', duration: '8.2s' },
    { size: 'h-2 w-2', x: 'left-[78%]', y: 'top-[22%]', delay: '0.6s', duration: '9s' },
    { size: 'h-1.5 w-1.5', x: 'left-[85%]', y: 'top-[70%]', delay: '2.1s', duration: '7.6s' },
    { size: 'h-1 w-1', x: 'left-[50%]', y: 'top-[14%]', delay: '0.3s', duration: '8.8s' },
    { size: 'h-1.5 w-1.5', x: 'left-[61%]', y: 'top-[82%]', delay: '1.7s', duration: '7.9s' },
  ]

  return (
    <div
      className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-950"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 splash-radial-overlay" />

      {particles.map((particle, index) => (
        <span
          key={index}
          className={`pointer-events-none absolute ${particle.size} ${particle.x} ${particle.y} rounded-full bg-white/60 splash-particle-float`}
          style={{
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}

      <div className="relative z-10 flex min-h-screen min-h-[100dvh] items-center justify-center px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/5 backdrop-blur-xl splash-icon-glow"
            role="status"
            aria-label="Launching ShikshaSahayak"
          >
            <div className="absolute h-16 w-16 rounded-2xl border border-white/30" />
            <div className="absolute h-2 w-2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.85)]" />
            <div className="absolute h-[1px] w-10 bg-white/70" />
            <div className="absolute h-10 w-[1px] bg-white/70" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              ShikshaSahayak
            </h1>
            <p className="text-sm font-medium tracking-[0.18em] text-indigo-100/90 uppercase sm:text-base">
              Offline AI Tutor for NCERT
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
