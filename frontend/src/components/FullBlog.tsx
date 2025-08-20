import { FileText, XCircle, Sparkle } from "lucide-react";
import { Blog } from "../hooks";
import { useLike } from "../hooks/useLike";
import { Appbar } from "./Appbar";
import { BackButton } from "./BackButton";
import { Avatar } from "./BlogCard";
import { LikeButton } from "./LikeButton";
import { PostedDate } from "./PostedDate";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../config";
import { useAuthStore } from "../store/auth";
import { toast } from "react-toastify";
import { Spinner } from "./Spinner";
import { ShareMenu } from "./ShareMenu";

export const FullBlog = ({ blog }: { blog: Blog }) => {
    const { token } = useAuthStore();
    const { liked, likes, toggleLike } = useLike(blog.id, blog._count.likes);
    const [hovered, setHovered] = useState<boolean>(false);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const generateSummary = async () => {
        setLoading(true);
        setSummary("");
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/blog/ai-summary`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: blog.content }),
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                const chunk = decoder.decode(value, { stream: true });

                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
                lines.forEach(line => {
                    const dataStr = line.substring(5).trim();
                    if (dataStr === "[DONE]") {
                        reader.cancel(); 
                        return;
                    }

                    try {
                        const data = JSON.parse(dataStr);
                        setSummary(prev => prev + data.content);
                    } catch (e) {
                        console.error("Error parsing SSE data:", e, line);
                    }
                });
            }

        } catch (error) {
            setLoading(false);
            toast.error("Error generating summary");
            console.log("Error generating summary : ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Appbar navigateTo="/blogs" label={<BackButton />} />
            <div className="flex justify-center px-4 py-6 w-full">
                <div className="grid grid-cols-1 space-x-10 lg:grid-cols-12 max-w-7xl">
                    <div className="lg:col-span-8">
                        <div className="flex justify-between items-center">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold pb-5">
                                {blog.title}
                            </div>

                            <ShareMenu url={window.location.href} title={blog.title} />
                        </div>

                        <div className="flex flex-wrap gap-2 py-2">
                            {Array.isArray(blog.labels) &&
                                blog.labels.map((label) =>
                                    label === "AI Generated" ? (
                                        <span
                                            key={label}
                                            className="bg-blue-100 border border-blue-400 text-blue-700 font-semibold py-1 px-3 rounded-full flex items-center gap-1 text-xs select-none"
                                        >
                                            <Sparkle size={15} className="text-blue-500" />
                                            {label}
                                        </span>
                                    ) : (
                                        <span
                                            key={label}
                                            className="bg-neutral-100 border border-neutral-200 text-gray-700 py-1 px-3 rounded-full flex items-center gap-1 text-xs"
                                        >
                                            {label}
                                        </span>
                                    )
                                )}
                        </div>
                        <div className="pt-6">
                            <LikeButton liked={liked} likes={likes} onClick={toggleLike} />
                        </div>
                        <div className="text-slate-500 pt-3 sm:pt-5 text-sm sm:text-base">
                            Posted on <PostedDate date={blog.date} />
                        </div>

                        <div
                            className="pt-4 text-base sm:text-lg leading-relaxed prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </div>

                    <div className="lg:col-span-4 space-y-10 ml-10">
                        <div>
                            <div className="text-slate-600 font-bold text-lg sm:text-xl">
                                Author
                            </div>
                            <div className="flex items-start gap-4 pt-4">
                                <div className="w-16 pt-1">
                                    <Avatar
                                        name={blog.author.name}
                                        authorData={blog.author}
                                        size="small"
                                    />
                                </div>
                                <div>
                                    <div className="text-xl font-bold">{blog.author.name}</div>
                                    <div className="pt-2 text-slate-500 text-sm sm:text-base">
                                        {blog.author.bio}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {hovered ? (
                            <motion.div
                                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-56 rounded-xl bg-neutral-100 p-4 overflow-y-auto shadow-lg"
                                layoutId="hover"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-gray-700">
                                        AI Generated Summary
                                    </p>
                                    <XCircle
                                        onClick={() => setHovered(false)}
                                        className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors"
                                        size={22}
                                    />
                                </div>
                                <div className="flex justify-center text-gray-800 text-sm whitespace-pre-line">
                                    {loading ? <Spinner size="big" /> : summary}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                layoutId="hover"
                                onClick={() => {
                                    setHovered(true);
                                    generateSummary();
                                }}
                                title="See summary"
                                className="rounded-full flex justify-center items-center bg-neutral-300 shadow cursor-pointer w-10 h-10 hover:bg-neutral-400 transition-colors"
                            >
                                <FileText />
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
