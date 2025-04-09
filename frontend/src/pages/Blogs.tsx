import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";

export const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center gap-6 py-6">
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
                <BlogSkeleton />
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden">
            <Appbar />
            <div className="flex justify-center px-4 md:px-10 py-6">
                <div className="w-full max-w-screen-md flex flex-col gap-6">
                    {blogs.map((blog) => (
                        <BlogCard
                            key={blog.id}
                            id={blog.id}
                            authorName={blog.author.name || "Anonymous"}
                            title={blog.title}
                            content={blog.content}
                            publishedDate={blog.date}
                            likes= {blog._count.likes || 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
