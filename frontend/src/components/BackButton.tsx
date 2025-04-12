import { useNavigate } from "react-router-dom";

export const BackButton = () => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate('/blogs')}
            className="flex justify-center items-center hover:text-gray-700 transition duration-200 ease-in-out cursor-pointer"
        >
            <svg
                className="w-6 h-6 text-slate-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
            >
                <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 5H1m0 0 4 4M1 5l4-4"
                />
            </svg>
        </button>
    );
};