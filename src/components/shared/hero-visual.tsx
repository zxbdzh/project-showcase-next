/**
 * Hero 静态视觉:Apple 风柔和光晕渐变。纯 CSS,无 WebGL 开销。
 * prefers-reduced-motion 时光晕静止。
 */
export function HeroVisual() {
  return (
    <div className="from-brand-subtle via-background to-brand-subtle relative size-full overflow-hidden bg-gradient-to-br">
      <div
        aria-hidden
        className="hero-orb-a bg-brand/30 absolute -top-1/4 left-1/6 size-2/3 rounded-full blur-3xl"
      />
      <div
        aria-hidden
        className="hero-orb-b absolute top-1/4 right-1/6 size-1/2 rounded-full bg-indigo-400/25 blur-3xl"
      />
      <div
        aria-hidden
        className="hero-orb-c absolute bottom-0 left-1/3 size-1/2 rounded-full bg-violet-400/20 blur-3xl"
      />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
}
