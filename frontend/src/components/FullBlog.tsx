import { FileText, XCircle } from "lucide-react";
import { Blog } from "../hooks";
import { useLike } from "../hooks/useLike";
import { Appbar } from "./Appbar";
import { BackButton } from "./BackButton";
import { Avatar } from "./BlogCard";
import { LikeButton } from "./LikeButton";
import { PostedDate } from "./PostedDate";
import { motion } from "motion/react";
import { useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useAuthStore } from "../store/auth";
import { toast } from "react-toastify";
import { Spinner } from "./Spinner";

export const FullBlog = ({ blog }: { blog: Blog }) => {
    const { token } = useAuthStore();
    const { liked, likes, toggleLike } = useLike(blog.id, blog._count.likes);
    const [hovered, setHovered] = useState<boolean>(false);
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);

    const generateSummary = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/blog/ai-summary`,
                {
                    content: blog.content,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLoading(false);
            setSummary(response.data.summary);
        } catch (error) {
            toast.error("Error generating summary");
            console.log("Error generating summary : ", error);
            return;
        }
    };
    return (
        <div className="w-full">
            <Appbar navigateTo="/blogs" label={<BackButton />} />
            <div className="flex justify-center px-4 py-6 w-full">
                <div className="grid grid-cols-1 space-x-10 lg:grid-cols-12 max-w-7xl">
                    <div className="lg:col-span-8">
                        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
                            {blog.title}
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
                                    <p className="font-semibold text-gray-700">AI Generated Summary</p>
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
