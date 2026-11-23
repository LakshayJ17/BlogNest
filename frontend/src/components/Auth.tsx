import { FormEvent, ReactNode, useEffect, useId, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Check, Circle, Eye, EyeSlash, GoogleLogo, Warning } from "@phosphor-icons/react";
import { api, getErrorMessage } from "../lib/api";
import { safeRedirectPath } from "../lib/session";
import { useAuthStore } from "../store/auth";
import { Logo } from "./Logo";
import { Quote } from "./Quote";
import { Spinner } from "./Spinner";
import { buttonClasses, textLink } from "./ui/button";
import { cn } from "../lib/utils";

const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
// In production, hide Google sign-in entirely when it isn't configured. In local
// development, show a disabled button with setup instructions instead.
const SHOW_GOOGLE = GOOGLE_ENABLED || import.meta.env.DEV;

function passwordRules(password: string) {
  return [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Upper and lowercase letters", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "A number", ok: /\d/.test(password) },
    { label: "A symbol, like ! or #", ok: /[^A-Za-z0-9]/.test(password) },
  ];
}

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const isSignup = type === "signup";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeRedirectPath(params.get("next"));
  const { user, setToken, fetchUserData } = useAuthStore();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"form" | "google" | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin-dashboard" : (next ?? "/blogs"), { replace: true });
    }
  }, [user, navigate, next]);

  const rules = passwordRules(form.password);
  const passwordOk = rules.every((r) => r.ok);

  const update = (field: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (error) setError("");
  };

  const completeSignIn = async (jwt: string) => {
    setToken(jwt);
    await fetchUserData(); // the effect above redirects once the user loads
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSignup && !passwordOk) {
      setError("Your password doesn't meet all the requirements yet.");
      return;
    }

    setBusy("form");
    setError("");
    try {
      const body = isSignup ? form : { email: form.email, password: form.password };
      const { data } = await api.post<{ jwt: string }>(`/user/${type}`, body);
      await completeSignIn(data.jwt);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleGoogle = async (credential?: string) => {
    if (!credential) {
      setError("Google sign-in didn't complete. Please try again.");
      return;
    }
    setBusy("google");
    setError("");
    try {
      const { data } = await api.post<{ jwt: string }>("/user/google-auth", { credential });
      await completeSignIn(data.jwt);
    } catch (err) {
      setError(getErrorMessage(err, "Google sign-in failed. Please try again."));
    } finally {
      setBusy(null);
    }
  };

  const switchHref = `${isSignup ? "/signin" : "/signup"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="grid min-h-[100dvh] bg-paper lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <Link to="/blogs" className={buttonClasses({ variant: "ghost", size: "sm" })}>
            Browse as guest
          </Link>
        </div>

        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-serif text-[2.5rem] font-medium leading-[1.1] tracking-[-0.025em] text-ink">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-[15px] text-muted">
              {isSignup ? "Start writing and sharing stories in minutes." : "Sign in to keep writing and reading."}
            </p>

            {SHOW_GOOGLE && (
              <>
                <div className="mt-8 flex min-h-11 flex-col items-center gap-2">
                  {!GOOGLE_ENABLED ? (
                    // Local development only: explain why the real button is missing.
                    <>
                      <button
                        type="button"
                        disabled
                        className={buttonClasses({ variant: "secondary", className: "h-11 w-full max-w-[320px]" })}
                      >
                        <GoogleLogo size={18} weight="bold" aria-hidden="true" />
                        {isSignup ? "Sign up with Google" : "Sign in with Google"}
                      </button>
                      <p className="text-center text-xs text-muted">
                        Add <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> to <code className="font-mono">frontend/.env</code>{" "}
                        and restart <code className="font-mono">npm run dev</code> to turn this on.
                      </p>
                    </>
                  ) : busy === "google" ? (
                    <span className="inline-flex items-center gap-2 text-sm text-muted">
                      <Spinner /> Signing you in...
                    </span>
                  ) : (
                    <GoogleLogin
                      onSuccess={(res) => handleGoogle(res.credential)}
                      onError={() => setError("Google sign-in failed. Please try again.")}
                      text={isSignup ? "signup_with" : "signin_with"}
                      shape="rectangular"
                      width="320"
                    />
                  )}
                </div>
                <div className="my-7 flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                  <span className="h-px flex-1 bg-line" />
                  or with email
                  <span className="h-px flex-1 bg-line" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} noValidate={false} className={cn("space-y-4", !SHOW_GOOGLE && "mt-8")}>
              {isSignup && (
                <Field label="Name" optional>
                  {(id) => (
                    <input
                      id={id}
                      type="text"
                      autoComplete="name"
                      maxLength={60}
                      value={form.name}
                      onChange={(e) => update("name")(e.target.value)}
                      placeholder="How readers will see you"
                      className={inputClass}
                    />
                  )}
                </Field>
              )}

              <Field label="Email">
                {(id) => (
                  <input
                    id={id}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email")(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                )}
              </Field>

              <Field label="Password">
                {(id) => (
                  <div>
                    <div className="relative">
                      <input
                        id={id}
                        type={showPassword ? "text" : "password"}
                        autoComplete={isSignup ? "new-password" : "current-password"}
                        required
                        maxLength={128}
                        value={form.password}
                        onChange={(e) => update("password")(e.target.value)}
                        aria-describedby={isSignup ? `${id}-rules` : undefined}
                        className={cn(inputClass, "pr-11")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        aria-pressed={showPassword}
                        className="focus-ring absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-md text-faint transition-colors hover:text-ink"
                      >
                        {showPassword ? <EyeSlash size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                      </button>
                    </div>
                    {isSignup && (
                      <ul id={`${id}-rules`} className="mt-3 grid grid-cols-1 gap-1.5 text-[13px] sm:grid-cols-2">
                        {rules.map((rule) => (
                          <li
                            key={rule.label}
                            className={cn("flex items-center gap-1.5", rule.ok ? "text-tag-green" : "text-muted")}
                          >
                            {rule.ok ? <Check size={13} weight="bold" aria-hidden="true" /> : <Circle size={11} aria-hidden="true" />}
                            {rule.label}
                            <span className="sr-only">{rule.ok ? "(met)" : "(not met)"}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </Field>

              {error && (
                <div role="alert" className="flex items-start gap-2 rounded-md border border-[#f3d3d3] bg-tag-red-bg px-3 py-2.5 text-sm text-tag-red">
                  <Warning size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={busy !== null} className={buttonClasses({ size: "lg", className: "w-full" })}>
                {busy === "form" && <Spinner />}
                {isSignup ? "Create account" : "Sign in"}
              </button>
            </form>

            <p className="mt-8 text-sm text-muted">
              {isSignup ? "Already have an account?" : "New to BlogNest?"}{" "}
              <Link to={switchHref} className={textLink}>
                {isSignup ? "Sign in" : "Create an account"}
              </Link>
            </p>
          </div>
        </main>
      </div>

      <Quote />
    </div>
  );
};

const inputClass =
  "block h-11 w-full rounded-md border border-line-strong bg-surface px-3.5 text-[15px] text-ink placeholder:text-faint " +
  "transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-faint">(optional)</span>}
      </label>
      {children(id)}
    </div>
  );
}
