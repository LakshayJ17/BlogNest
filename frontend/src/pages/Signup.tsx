import { Helmet } from "react-helmet-async";
import { Auth } from "../components/Auth";

export const Signup = () => (
  <>
    <Helmet>
      <title>Create your account | BlogNest</title>
    </Helmet>
    <Auth type="signup" />
  </>
);
