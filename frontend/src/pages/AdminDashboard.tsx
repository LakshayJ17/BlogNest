import { useAuthStore } from "../store/auth";
import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { Unauthorized } from "../components/Unauthorized";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useBlogs } from "../hooks";
import { BlogCard } from "../components/BlogCard";
import { motion } from "motion/react"

export const AdminDashboard = () => {
    const { user, token, isLoading } = useAuthStore();
    const [stats, setStats] = useState<{ totalUsers: number; totalBlogs: number }>({
        totalUsers: 0,
        totalBlogs: 0,
    });

    const { blogs, loading } = useBlogs();

    useEffect(() => {
        if (user?.role === "admin") {
            axios.get(`${BACKEND_URL}/api/v1/admin/all-details`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => setStats(res.data))
                .catch(() => setStats({ totalUsers: 0, totalBlogs: 0 }));
        }
    }, [token, user?.role]);

    if (isLoading || loading) {
        return (
            <>
                <Appbar navigateTo="/admin-dashboard" label="BlogNest" />
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <h1 className="text-2xl font-bold mb-4">Welcome, BlogNest Admin</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-100 rounded-lg p-6 shadow flex flex-col items-center animate-pulse">
                            <span className="h-6 w-24 bg-slate-200 rounded mb-2" />
                            <span className="h-10 w-20 bg-slate-200 rounded" />
                        </div>
                        <div className="bg-slate-100 rounded-lg p-6 shadow flex flex-col items-center animate-pulse">
                            <span className="h-6 w-24 bg-slate-200 rounded mb-2" />
                            <span className="h-10 w-20 bg-slate-200 rounded" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-2">Posts to be reviewed</h2>
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-white  rounded-lg p-6 shadow animate-pulse h-80 w-120" />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (user?.role !== "admin") {
        return <Unauthorized />;
    }

    const reportedBlogs = blogs.filter((blog) => blog.isReported);

    return (
        <>
            <Appbar navigateTo="/admin-dashboard" label="BlogNest" />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Welcome, BlogNest Admin</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="bg-slate-100 rounded-lg p-6 shadow flex flex-col items-center">
                        <span className="text-lg font-semibold text-blue-800">Total Users</span>
                        <span className="text-3xl font-bold mt-2">{stats.totalUsers}</span>
                    </div>
                    <div className="bg-slate-100 rounded-lg p-6 shadow flex flex-col items-center">
                        <span className="text-lg font-semibold text-blue-800">Total Posts</span>
                        <span className="text-3xl font-bold mt-2">{stats.totalBlogs}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-2">Posts to be reviewed</h2>
                    {reportedBlogs.length === 0 ? (
                        <div className="text-slate-500 text-center py-8">No reported posts to review.</div>
                    ) : (
                        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                            {reportedBlogs.map((blog, idx) => (
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
                                >                                <BlogCard
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
                                        currentUserRole={user?.role}
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