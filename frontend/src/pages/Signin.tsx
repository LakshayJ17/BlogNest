import { Helmet } from "react-helmet-async";
import { Auth } from "../components/Auth";

export const Signin = () => (
  <>
    <Helmet>
      <title>Sign in | BlogNest</title>
    </Helmet>
    <Auth type="signin" />
  </>
);
