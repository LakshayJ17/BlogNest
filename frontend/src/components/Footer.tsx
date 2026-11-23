import { Link } from "react-router-dom";
import { LABELS } from "../lib/types";
import { Logo } from "./Logo";

const linkClass = "focus-ring rounded-sm text-ink-soft transition-colors hover:text-accent";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bone">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-10 pt-16 sm:px-8 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted">
            A blogging platform for people with something to say, and for the readers who want to hear it.
          </p>
        </div>

        <nav aria-label="Topics" className="md:col-span-4">
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">Topics</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            {LABELS.map((label) => (
              <li key={label}>
                <Link to={`/blogs?label=${encodeURIComponent(label)}`} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer" className="md:col-span-3">
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">BlogNest</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/blogs" className={linkClass}>
                Latest stories
              </Link>
            </li>
            <li>
              <Link to="/blogs?sort=popular" className={linkClass}>
                Most liked
              </Link>
            </li>
            <li>
              <Link to="/publish" className={linkClass}>
                Write a story
              </Link>
            </li>
            <li>
              <Link to="/signin" className={linkClass}>
                Sign in
              </Link>
            </li>
          </ul>
        </nav>

        <p className="border-t border-line pt-6 font-mono text-xs text-muted md:col-span-12">
          &copy; {new Date().getFullYear()} BlogNest
        </p>
      </div>
    </footer>
  );
}
