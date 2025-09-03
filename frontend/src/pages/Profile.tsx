import { Appbar } from "../components/Appbar";
import { Avatar, BlogCard } from "../components/BlogCard";
import { useAuthStore } from "../store/auth";

export const ProfilePage = () => {
    const { user } = useAuthStore();
    const name = user?.name || "Anonymous";

    return (
        <div className="min-h-screen bg-gray-50">
            <Appbar label="BlogNest" navigateTo="/blogs" />
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center space-y-4 mb-10">
                    <Avatar name={name} authorData={user} size="big" />
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="text-gray-500">{user?.email}</p>
                    <p className="text-gray-600 text-center">{user?.bio}</p>
                    <p className="text-sm text-gray-400">
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
                    <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                        {user?.posts?.length ? (
                            user.posts.map((blog) => (
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
