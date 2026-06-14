"use client";

/**
 * Decorative faded dashboard mock for the login brand panel.
 */
export default function LoginDashboardIllustration() {
  return (
    <div
      aria-hidden
      className="login-dashboard-illustration pointer-events-none relative mt-5 hidden select-none sm:block lg:mt-6"
    >
      <div className="login-dashboard-illustration__glow absolute -inset-4 rounded-2xl bg-purple-400/10 blur-2xl dark:bg-purple-600/10" />

      <div className="login-dashboard-illustration__frame relative overflow-hidden rounded-xl border border-purple-200/50 bg-white/70 shadow-[0_12px_40px_-20px_rgba(124,58,237,0.35)] dark:border-purple-500/20 dark:bg-slate-900/50">
        <div className="flex items-center gap-1.5 border-b border-purple-100/80 px-3 py-2 dark:border-purple-500/15">
          <span className="size-2 rounded-full bg-red-400/70" />
          <span className="size-2 rounded-full bg-amber-400/70" />
          <span className="size-2 rounded-full bg-emerald-400/70" />
          <span className="ms-auto h-1.5 w-16 rounded-full bg-purple-200/80 dark:bg-purple-500/20" />
        </div>

        <div className="flex gap-0">
          <div className="w-[28%] space-y-2 border-e border-purple-100/60 p-2.5 dark:border-purple-500/10">
            <div className="h-1.5 w-full rounded-full bg-purple-300/50 dark:bg-purple-500/25" />
            <div className="h-1.5 w-4/5 rounded-full bg-slate-200/80 dark:bg-slate-700/60" />
            <div className="h-1.5 w-full rounded-full bg-slate-200/60 dark:bg-slate-700/40" />
            <div className="mt-2 h-1.5 w-3/5 rounded-full bg-purple-200/70 dark:bg-purple-500/20" />
            <div className="h-1.5 w-full rounded-full bg-slate-200/50 dark:bg-slate-700/35" />
          </div>

          <div className="min-w-0 flex-1 space-y-2.5 p-2.5">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-md bg-purple-100/80 p-2 dark:bg-purple-500/15">
                <div className="h-1 w-6 rounded-full bg-purple-400/60 dark:bg-purple-400/40" />
                <div className="mt-1.5 h-2 w-8 rounded-sm bg-purple-500/30 dark:bg-purple-400/25" />
              </div>
              <div className="rounded-md bg-slate-100/80 p-2 dark:bg-slate-800/50">
                <div className="h-1 w-5 rounded-full bg-slate-300/70 dark:bg-slate-600" />
                <div className="mt-1.5 h-2 w-7 rounded-sm bg-slate-300/50 dark:bg-slate-600/50" />
              </div>
              <div className="rounded-md bg-slate-100/80 p-2 dark:bg-slate-800/50">
                <div className="h-1 w-5 rounded-full bg-slate-300/70 dark:bg-slate-600" />
                <div className="mt-1.5 h-2 w-6 rounded-sm bg-slate-300/50 dark:bg-slate-600/50" />
              </div>
            </div>

            <div className="space-y-1.5 rounded-lg border border-purple-100/60 bg-purple-50/40 p-2 dark:border-purple-500/15 dark:bg-purple-950/20">
              {[72, 58, 85, 64].map((w) => (
                <div key={w} className="flex items-center gap-1.5">
                  <span className="size-3 shrink-0 rounded bg-purple-200/70 dark:bg-purple-500/20" />
                  <span
                    className="h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/55"
                    style={{ width: `${w}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
