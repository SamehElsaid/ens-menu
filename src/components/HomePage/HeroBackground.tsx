export default function HeroBackground() {
  return (
    <div
      className="hero-background pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="hero-background-grid absolute inset-0 opacity-[0.06] dark:opacity-[0.04] lg:opacity-[0.08] lg:dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="hero-background-blur hidden lg:block">
        {[...Array(4)].map((_, i) => (
          <div
            key={`orb-${i}`}
            className="absolute h-[400px] w-[400px] rounded-full opacity-[0.1] blur-[140px] dark:opacity-[0.15]"
            style={{
              top: `${(i % 2) * 40}%`,
              left: `${i * 25}%`,
            }}
          />
        ))}
      </div>

      <div className="absolute right-0 bottom-0 left-0 h-32 bg-linear-to-t from-white to-transparent dark:from-[#0d1117]" />
    </div>
  );
}
