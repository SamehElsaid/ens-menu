export default function HeroBackground() {
  return (
    <div
      className="hero-background pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="hero-background-grid absolute inset-0 opacity-[0.035] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

    </div>
  );
}
