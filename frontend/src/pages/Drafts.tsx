import { Link } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { useDraft } from "../hooks";
import { PlusCircle } from "lucide-react";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useAuthStore } from "../store/auth";
import { Unauthorized } from "../components/Unauthorized";

export const Drafts = () => {
    const { loading, drafts } = useDraft();
    const {user} = useAuthStore();
    if (!user){
        return <Unauthorized />
    }
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

            <div className="flex justify-center px-4 md:px-10 py-6">
                {drafts.length === 0 ? (
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
                        {drafts.map((draft) => (
                            <BlogCard
                                type="draft"
                                key={draft.id}
                                id={draft.id}
                                author={draft.author}
                                title={draft.title}
                                content={draft.content}
                                publishedDate={draft.date}
                                _count={draft._count}
                                labels={draft.labels}
                                status={draft.status}
                                currentUserRole={user?.role}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
