import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUserSecret, FaArrowRight } from "react-icons/fa";

export const Unauthorized = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [excuse, setExcuse] = useState("");

    const funnyExcuses = [
        "🚔 Blog Police says NOPE!",
        "😼 Our Security Cat didn’t approve you.",
        "🔥 This page is on fire. (Metaphorically.)",
        "🔒 Firewall says you're too cool for this page.",
        "🕵️‍♂️ We see you sneaking in. Nice try."
    ]; 

    useEffect(() => {
        if (!token) {
            setExcuse(funnyExcuses[Math.floor(Math.random() * funnyExcuses.length)]);
        } 
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-6">
            <FaUserSecret className="text-6xl text-gray-700 mb-4 animate-bounce" />
            <h1 className="text-2xl font-bold text-gray-800">Hold up! 🚫</h1>
            <p className="text-lg text-gray-600 mt-2">{excuse}</p>
            <p className="text-md text-gray-500 mt-1">Only authorized bloggers can publish articles.</p>

            <button
                onClick={() => navigate("/signin")}
                className="cursor-pointer mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md flex items-center gap-2 hover:bg-blue-700 transition-all"
            >
                <FaLock />
                Totally Not Suspicious Sign-in
                <FaArrowRight />
            </button>

            <p className="text-sm text-gray-400 mt-3">We promise not to judge your password strength. 🔑</p>
        </div>
    );
};
