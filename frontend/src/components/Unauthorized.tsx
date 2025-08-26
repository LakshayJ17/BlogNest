import { useNavigate } from "react-router-dom";

export const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 text-center p-6">
            <div className="bg-white rounded-full p-4 shadow mb-6">
                <svg
                    className="w-12 h-12 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 11v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Sign in required</h1>
            <p className="text-gray-600 mb-6">
                Please sign in to continue and access this page.
            </p>
            <button
                onClick={() => navigate("/signup")}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all font-semibold text-base"
            >
                Go to Sign Up
            </button>
        </div>
    );
};