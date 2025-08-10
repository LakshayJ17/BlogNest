import { ChevronLeft } from "lucide-react";

export const BackButton = () => {
    return (
        <button
            className="flex justify-center items-center hover:text-gray-700 transition duration-200 ease-in-out cursor-pointer"
        >
            <ChevronLeft />
        </button>
    );
};