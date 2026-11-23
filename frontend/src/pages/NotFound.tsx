import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FileX } from "@phosphor-icons/react";
import { PageShell } from "../components/PageShell";
import { EmptyState } from "../components/EmptyState";
import { buttonClasses } from "../components/ui/button";

export const NotFound = () => (
  <PageShell>
    <Helmet>
      <title>Page not found | BlogNest</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <EmptyState
      icon={FileX}
      title="There's no page here"
      description="The link may be old, or the page has moved."
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/blogs" className={buttonClasses()}>
            Browse stories
          </Link>
          <Link to="/" className={buttonClasses({ variant: "secondary" })}>
            Go to the home page
          </Link>
        </div>
      }
    />
  </PageShell>
);
