import { useAuthStore } from "../store/auth";
import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { Unauthorized } from "../components/Unauthorized";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useBlogs } from "../hooks";
import { BlogCard } from "../components/BlogCard";

export const AdminDashboard = () => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<{ totalUsers: number; totalBlogs: number }>({
    totalUsers: 0,
    totalBlogs: 0,
  });

  const { blogs } = useBlogs();

  useEffect(() => {
    if (user?.role === "admin") {
      axios
        .get(`${BACKEND_URL}/api/v1/admin/all-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => setStats(res.data))
        .catch(() => setStats({ totalUsers: 0, totalBlogs: 0 }));
    }
  }, [token, user?.role]);

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
              {reportedBlogs.map((blog) => (
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
                  currentUserRole={user?.role}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};