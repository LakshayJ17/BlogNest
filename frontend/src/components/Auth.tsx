import { SignupInput } from "@lakshayj17/common-app";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";
import { Spinner } from "./Spinner";
import { useAuthStore } from "../store/auth";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { BackButton } from "./BackButton";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
  const notify = () => toast.error("Error while signing up");

  const [postInputs, setPostInputs] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const setToken = useAuthStore((state) => state.setToken);

  async function sendRequest() {
    setLoading(true);
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
        postInputs
      );

      const { jwt } = response.data;
      setToken(jwt);

      navigate("/blogs");
    } catch (error) {
      notify();

      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleAuth = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/google-auth`,
        {
          email: decoded.email,
          name: decoded.name,
          googleId: decoded.sub,
          avatar: decoded.picture,
        }
      );

      const { jwt } = response.data;
      setToken(jwt);
      navigate("/blogs");
    } catch (error) {
      notify();
      console.log("Error in google auth", error);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
          <BackButton />
        </div>

        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {type === "signup" ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-gray-600">
            {type === "signup"
              ? "Already have an account?"
              : "Don't have an account?"}
            <Link
              className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
              to={type === "signin" ? "/signup" : "/signin"}
            >
              {type === "signup" ? "Sign In" : "Sign Up"}
            </Link>
          </p>
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            sendRequest();
          }}
        >
          {type === "signup" && (
            <LabeledInput
              label="Name"
              placeholder="Enter your name"
              onChange={(e) => {
                setPostInputs({
                  ...postInputs,
                  name: e.target.value,
                });
              }}
            />
          )}

          <LabeledInput
            label="Email"
            placeholder="Enter your email"
            onChange={(e) => {
              setPostInputs({
                ...postInputs,
                email: e.target.value,
              });
            }}
          />

          <LabeledInput
            label="Password"
            type="password"
            placeholder="Enter password"
            onChange={(e) => {
              setPostInputs({
                ...postInputs,
                password: e.target.value,
              });
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner size="small" />
              </div>
            ) : type === "signup" ? (
              "Sign Up"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500 font-medium">
              or continue with
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleAuth}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text={type === "signup" ? "signup_with" : "signin_with"}
            shape="pill"
          />
        </div>
      </div>
    </div>
  );
};

interface LabeledInputType {
  label: string;
  placeholder: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}

function LabeledInput({
  label,
  placeholder,
  onChange,
  type,
}: LabeledInputType) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          onChange={onChange}
          type={isPasswordField && !showPassword ? "password" : "text"}
          className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
          placeholder={placeholder}
          required
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}
