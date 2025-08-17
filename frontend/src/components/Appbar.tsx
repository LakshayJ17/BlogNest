import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "./BlogCard";
import { useAuthStore } from "../store/auth";
import { User, LogOut } from "lucide-react";

interface AppBarProps { 
    label: React.ReactNode; 
    navigateTo: string; 
    buttons?: React.ReactNode 
}

export const Appbar = ({ navigateTo, label, buttons }: AppBarProps ) => {
    const { user, logout } = useAuthStore()
    const name = user?.name || "Anonymous";

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = "/";
    };

    return (
        <div className="w-full border-b flex justify-between items-center px-5 sm:px-10 py-4">
            <Link to={navigateTo}>
                <div className="text-xl font-semibold cursor-pointer">{label}</div>
            </Link>

            <div className="relative flex items-center gap-2 pr-2" ref={dropdownRef}>
                {buttons}

                <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="cursor-pointer hover:scale-105 transition-transform duration-150"
                >
                    <Avatar name={name} authorData={user} size="big" />
                </div>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-42 w-56 bg-white rounded-xl shadow-md z-50 border border-gray-200 overflow-hidden transition-all duration-150">
                        <div className="px-4 py-3 text-sm text-gray-800 font-medium border-b">{name}</div>

                        <Link to="/profile">
                            <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all">
                                <User className="w-4 h-4 stroke-[1.5]" />
                                <span>Profile</span>
                            </div>
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 transition-all"
                        >
                            <LogOut className="w-4 h-4 stroke-[1.5]" />
                            <span>Logout</span>
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
