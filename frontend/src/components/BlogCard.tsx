import { Link } from "react-router-dom";
import { PostedDate } from "./PostedDate";
import { useLike } from "../hooks/useLike";
import { LikeButton } from "./LikeButton";

interface BlogCardProps {
    id: string;
    author : {
        name: string;
        googleId?: string;
        avatar?: string;
    }
    title: string;
    content: string;
    publishedDate: string;
    _count: {
        likes: number;
    };
}

export const BlogCard = ({
    author,
    title,
    content,
    publishedDate,
    id,
    _count,
}: BlogCardProps) => {
    const { liked, likes, toggleLike } = useLike(id, _count.likes);
    const minutes = Math.ceil(content.split(" ").length / 200);

    return (
        <div className="group p-6 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition duration-200">
            <div className="flex items-center text-xs text-slate-500 mb-2">
                <Avatar name={author.name} authorData={author} />
                <span className="ml-2">{author.name}</span>
                <div className="mx-2 h-1 w-1 bg-slate-400 rounded-full" />
                <PostedDate date={publishedDate} />
            </div>

            <Link to={`/blog/${id}`}>
                <div className="space-y-2">
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
                        {title}
                    </h2>
                    <p className="text-sm text-slate-600 leading-snug line-clamp-2 prose" dangerouslySetInnerHTML={{__html: content}} />

                    <p className="text-xs text-slate-400 pt-1">
                        {minutes} {minutes > 1 ? "mins read" : "min read"}
                    </p>
                </div>
            </Link>

            <div className="mt-4">
                <LikeButton liked={liked} likes={likes} onClick={toggleLike} />
            </div>
        </div>
    );
};

export function Avatar({ 
    name, 
    size = "small",
    authorData
}: { 
    name: string; 
    size?: "small" | "big";
    authorData?: { 
        googleId?: string;
        avatar?: string;
    } | null;
}) {
    const sizeClasses = size === "small" ? "w-6 h-6 text-sm" : "w-10 h-10 text-lg";
    
    return (
        <>
            {authorData?.googleId ? (
                <img
                    src={authorData.avatar}
                    alt={name}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className={`rounded-full object-cover ${sizeClasses}`}
                />
            ) : (
                <div
                    className={`inline-flex items-center justify-center rounded-full bg-gray-800 text-white font-semibold ${sizeClasses}`}
                    style={{ lineHeight: 1 }}
                >
                    {name.trim()[0].toUpperCase()}
                </div>
            )}
        </>
    );
}
