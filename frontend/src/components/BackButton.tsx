import { useNavigate } from "react-router-dom";

export const BackButton = () => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate('/blogs')}
            className="h-8 w-8 rounded-full flex justify-center items-center bg-slate-500 hover:bg-gray-700 transition duration-200 ease-in-out cursor-pointer"
        >
            <svg
                className="w-4 h-4 text-white"
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