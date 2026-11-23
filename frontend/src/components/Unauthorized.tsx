import { Link, useLocation } from "react-router-dom";
import { LockSimple } from "@phosphor-icons/react";
import { PageShell } from "./PageShell";
import { EmptyState } from "./EmptyState";
import { buttonClasses } from "./ui/button";

export const Unauthorized = () => {
  const location = useLocation();
  const next = encodeURIComponent(location.pathname + location.search);

  return (
    <PageShell>
      <EmptyState
        icon={LockSimple}
        title="Sign in to keep going"
        description="You need an account to write, save drafts, and see your profile."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to={`/signin?next=${next}`} className={buttonClasses()}>
              Sign in
            </Link>
            <Link to={`/signup?next=${next}`} className={buttonClasses({ variant: "secondary" })}>
              Create an account
            </Link>
          </div>
        }
      />
    </PageShell>
  );
};
