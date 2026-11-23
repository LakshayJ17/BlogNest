/** Right-hand panel on the auth pages: a pull quote on warm paper. */
export const Quote = () => (
  <aside className="hidden border-l border-line bg-bone lg:flex lg:flex-col lg:justify-between lg:px-16 lg:py-14">
    <p className="kicker">From the archive of good advice</p>
    <figure className="max-w-lg">
      <blockquote className="font-serif text-[2.5rem] font-normal italic leading-[1.15] tracking-[-0.02em] text-ink">
        "There is no greater agony than bearing an untold story inside you."
      </blockquote>
      <figcaption className="mt-6 font-mono text-xs tracking-[0.12em] text-muted uppercase">Maya Angelou</figcaption>
    </figure>
    <p className="max-w-sm text-sm leading-relaxed text-muted">
      Write in a clean editor, save drafts as you go, and publish when it reads right.
    </p>
  </aside>
);
