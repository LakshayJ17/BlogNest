import { Link } from "react-router-dom";

interface BlogCardProps {
    authorName: string;
    title: string,
    content: string;
    publishedDate: string;
    id: string;
}
export const BlogCard = ({ authorName, title, content, publishedDate, id }: BlogCardProps) => {
    return <Link to={`/blog/${id}`}>
        <div className="border-b border-slate-200 pb-4 w-screen max-w-screen-md cursor-pointer hover:shadow-md hover:bg-slate-50 transition duration-200 ease-in-out">
            <div className="flex">
                <Avatar name={authorName} />
                <div className="font-normal pl-2 text-sm flex justify-center flex-col">
                    {authorName}
                </div>
                <div className="flex justify-center flex-col pl-2">
                    <Circle />
                </div>
                <div className="pl-2 font-thin font-slate-500 text-sm flex justify-center flex-col">
                    {publishedDate}
                </div>
            </div>

            <div className="font-semibold text-xl pt-2">
                {title}
            </div>
            <div className="text-md font-thin pt-1">
                {content.slice(0, 100) + "..."}
            </div>
            <div className="text-slate-500 text-sm font-thin pt-1">
                {`${Math.ceil(content.length / 100)} min(s) read`}
            </div>
        </div>
    </Link>


}

export function Circle() {
    return <div className="h-1 w-1 rounded-full bg-slate-400"></div>

}

export function Avatar({ name, size = "small" }: { name: string, size?: "small" | "big" }) {
    return <div className={`relative inline-flex justify-center items-center overflow-hidden bg-gray-600 rounded-full ${size === "small" ? "w-5 h-5" : "w-10 h-10"} `}>
        <span className={`font-normal text-gray-600 dark:text-gray-200 ${size === "small" ? "text-xs" : "text-md"}`}>{(name.trim())[0].toUpperCase()}</span>
    </div>
}

