import { Appbar } from "../components/Appbar";
import { Avatar, BlogCard } from "../components/BlogCard";
import { useAuthStore } from "../store/auth";
import { motion } from "motion/react";

export const ProfilePage = () => {
    const { user } = useAuthStore();
    const name = user?.name || "Anonymous";

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar label="BlogNest" navigateTo="/blogs" />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center space-y-4 mb-10">
                    <Avatar name={name} authorData={user} size="big" />
                    <h1 className="text-2xl font-bold text-center break-words">
                        {user?.name}
                    </h1>
                    <p className="text-gray-500 text-center break-words">{user?.email}</p>
                    <p className="text-gray-600 text-center break-words">{user?.bio}</p>
                    <p className="text-sm text-gray-400 text-center">
                        Joined on{" "}
                        {user?.joinedAt
                            ? new Date(user.joinedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })
                            : ""}
                    </p>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4 text-center sm:text-left">
                        Your Posts
                    </h2>
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                        {user?.posts?.length ? (
                            user.posts.map((blog, idx) => (
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
                                        author={user}
                                        authorId={user.id}
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
                            ))
                        ) : (
                            <div className="col-span-full text-center text-gray-400">
                                You have not published any posts yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
