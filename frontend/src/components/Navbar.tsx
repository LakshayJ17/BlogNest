import { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { BookOpenText, Notebook, NotePencil, SignOut, SquaresFour, User } from "@phosphor-icons/react";
import { useAuthStore } from "../store/auth";
import { Avatar } from "./Avatar";
import { Logo } from "./Logo";
import { Menu } from "./ui/Menu";
import { buttonClasses } from "./ui/button";
import { cn } from "../lib/utils";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "focus-ring rounded-sm py-1 text-sm transition-colors",
    isActive ? "text-ink underline decoration-accent decoration-2 underline-offset-[10px]" : "text-muted hover:text-ink"
  );

/**
 * Masthead: nav on the left, centered wordmark, actions on the right. Pass
 * `actions` to replace the default buttons (the editor passes Save and Publish).
 */
export function Navbar({ actions }: { actions?: ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const home = isAdmin ? "/admin-dashboard" : user ? "/blogs" : "/";

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const signinHref = `/signin?next=${encodeURIComponent(location.pathname + location.search)}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-float"
        >
          Skip to content
        </a>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-10">
            <Logo to={home} className="text-[1.625rem]" />
            <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
              {!isAdmin && (
                <>
                  <NavLink to="/blogs" end className={navLinkClass}>
                    Explore
                  </NavLink>
                  {user && (
                    <NavLink to="/drafts" className={navLinkClass}>
                      Drafts
                    </NavLink>
                  )}
                  {!user && (
                    <NavLink to="/blogs?sort=popular" className={() => navLinkClass({ isActive: false })}>
                      Most liked
                    </NavLink>
                  )}
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center justify-end gap-2">
            {actions ??
              (user && !isAdmin && (
                <Link to="/publish" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                  <NotePencil size={16} aria-hidden="true" />
                  <span className="max-sm:sr-only">Write</span>
                </Link>
              ))}

            {user ? (
              <Menu
                label="Account menu"
                triggerClassName="focus-ring ml-1 cursor-pointer rounded-full"
                trigger={<Avatar name={user.name} src={user.avatar} size="sm" />}
                header={
                  <div className="mb-1 border-b border-line px-3 pb-2.5 pt-2">
                    <p className="truncate text-sm font-medium text-ink">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                }
                items={[
                  { label: "Moderation", icon: SquaresFour, to: "/admin-dashboard", hidden: !isAdmin },
                  { label: "Explore", icon: BookOpenText, to: "/blogs", hidden: isAdmin, className: "md:hidden" },
                  { label: "Your profile", icon: User, to: "/profile", hidden: isAdmin },
                  { label: "Drafts", icon: Notebook, to: "/drafts", hidden: isAdmin },
                  { label: "Sign out", icon: SignOut, onSelect: handleLogout, tone: "danger" },
                ]}
              />
            ) : (
              <>
                <Link to={signinHref} className={buttonClasses({ variant: "ghost", size: "sm", className: "max-sm:hidden" })}>
                  Sign in
                </Link>
                <Link to="/signup" className={buttonClasses({ size: "sm" })}>
                  Start writing
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

    </>
  );
}
