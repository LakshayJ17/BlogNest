import { Link } from "react-router-dom"
import { Avatar } from "./BlogCard"

export const Appbar = () => {
    const name = localStorage.getItem("name") || "Anonymous"

    return <div className="w-full border-b flex justify-between items-center px-5 sm:px-10 py-4 ">
        <Link to={"/"}>
            <div className="flex flex-col justify-center text-xl cursor-pointer ">BlogNest</div>
        </Link>

        <div>
            <Link to={'/publish'}>
                <button type="button" className=" cursor-pointer mr-4 text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 transition duration-200 ease-in-out">New</button>
            </Link>

            <Avatar name={(name.trim())[0].toUpperCase()} size={"big"} />
        </div>
    </div>
}