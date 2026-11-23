export const BACKEND_URL: string =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? "http://localhost:8787" : "https://blognest-backend-yxsq.onrender.com");

export const SITE_URL = "https://blognest.bylakshayjain.online";
