import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
import { Link } from "react-router-dom";
import { PlusCircle } from "lucide-react";

export const Blogs = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [label, setLabel] = useState("");
    const { loading, blogs } = useBlogs(debouncedSearch, label);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(handler);
    }, [search]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center gap-6 py-6 bg-gray-50">
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-gray-50">
            <Appbar
                navigateTo="/blogs"
                label="BlogNest"
                buttons={
                    <Link to="/publish">
                        <button
                            type="button"
                            className="cursor-pointer text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium rounded-lg text-sm py-2 px-4 transition flex gap-2 items-center justify-center mr-2"
                        >
                            <PlusCircle />
                            New
                        </button>
                    </Link>
                }
            />
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 pt-10 pb-4">
                <input
                    type="text"
                    value={search}
                    placeholder="🔍 Search Blogs"
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-64"
                />

                <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition w-52"
                >
                    <option value="">All Labels</option>
                    <option value="AI Generated">AI Generated</option>
                    <option value="Technology">Technology</option>
                    <option value="Music">Music</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Sports">Sports</option>
                    <option value="Space">Space</option>
                    <option value="Hobby">Hobby</option>
                </select>
            </div>

            <div className="flex justify-center px-4 md:px-10 py-6">
                {blogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center w-full max-w-screen-md bg-white rounded-lg shadow-md py-16">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                            alt="No blogs"
                            className="w-24 h-24 mb-4 opacity-70"
                        />
                        <p className="text-lg text-gray-600 mb-2 font-semibold">
                            No blogs found
                        </p>
                        <p className="text-gray-400 mb-4">
                            Try a different search or label.
                        </p>
                        <Link
                            to="/publish"
                            className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                        >
                            Make your first post
                        </Link>
                    </div>
                ) : (
                    <div className="w-full max-w-screen-md flex flex-col gap-6">
                        {blogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                id={blog.id}
                                author={blog.author}
                                title={blog.title}
                                content={blog.content}
                                publishedDate={blog.date}
                                _count={blog._count}
                                labels={blog.labels}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
