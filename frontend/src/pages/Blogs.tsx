import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
import { Link, useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { useAuthStore } from "../store/auth";
import { motion } from "motion/react";
import { Helmet } from "react-helmet-async";

export const Blogs = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [label, setLabel] = useState("");
    const { loading, blogs } = useBlogs(debouncedSearch, label);
    const { user } = useAuthStore();

    const navigate = useNavigate();

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(search), 500);
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
        <>
            <Helmet>
                <title>Explore Blogs | BlogNest - Discover Stories & Insights</title>
                <meta
                    name="description"
                    content="Discover and explore blogs on BlogNest. Read stories about technology, AI, entertainment, sports, music, space, and more from our community of writers."
                />
                <meta
                    name="keywords"
                    content="blog posts, read blogs, discover stories, technology blogs, AI articles, entertainment news, sports blogs, music blogs, online articles, BlogNest"
                />
                <meta property="og:type" content="website" />
                <meta
                    property="og:title"
                    content="Explore Blogs | BlogNest"
                />
                <meta
                    property="og:description"
                    content="Discover and read blogs from our community of writers on technology, AI, entertainment, and more."
                />
                <meta
                    property="og:url"
                    content="https://blognest.bylakshayjain.online/blogs"
                />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Explore Blogs | BlogNest" />
                <meta name="twitter:description" content="Discover and read blogs from our community of writers." />
                <link rel="canonical" href="https://blognest.bylakshayjain.online/blogs" />
            </Helmet>

            <div className="min-h-screen overflow-x-hidden bg-gray-50">
                <Appbar
                    navigateTo={user ? "/blogs" : "/"}
                    label="BlogNest"
                buttons={
                    <div className="flex items-center gap-5">
                        <Link to={"/drafts"}>Drafts</Link>
                        <button
                            onClick={() => navigate("/publish")}
                            type="button"
                            className="cursor-pointer text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 font-medium rounded-lg text-sm py-2 px-4 transition flex gap-2 items-center justify-center mr-2"
                        >
                            <PlusCircle />
                            New
                        </button>
                    </div>
                }
            />
            <div className="flex justify-center items-center w-full px-2 md:px-0">
                <div className="w-full max-w-xl bg-white/90 backdrop-blur rounded-2xl shadow-lg flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 p-4 mt-8 mb-10 border border-gray-100">
                    <div className="flex items-center relative w-full md:w-80">
                        <span className="absolute left-3 text-gray-400">
                            <svg
                                width="20"
                                height="20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            value={search}
                            placeholder="Search blogs..."
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border border-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50"
                        />
                    </div>
                    <div className="flex items-center w-full md:w-60">
                        <select
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="w-full border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-gray-50"
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
                </div>
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
                        {blogs.map((blog, idx) => (
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    filter: "blur(10px)",
                                    y: 10,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    filter: "blur(0px)",
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.3,
                                    delay: idx * 0.1,
                                    ease: "easeInOut",
                                }}
                                key={blog.title}
                                className="group relative"
                            >
                                {" "}
                                <BlogCard
                                    type="publish"
                                    key={blog.id}
                                    id={blog.id}
                                    author={blog.author}
                                    authorId={blog.authorId}
                                    currentUserId={user?.id}
                                    title={blog.title}
                                    content={blog.content}
                                    publishedDate={blog.date}
                                    _count={blog._count}
                                    labels={blog.labels}
                                    status={blog.status}
                                    currentUserRole={user?.role ?? ""}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </>

    );
};
