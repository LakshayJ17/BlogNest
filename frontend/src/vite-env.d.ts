/// <reference types="vite/client" />
declare module "@fontsource-variable/*";


interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
}
