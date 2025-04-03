import { Blog } from "../hooks";
import { Appbar } from "./Appbar";
import { Avatar } from "./BlogCard";

export const FullBlog = ({ blog }: { blog: Blog }) => {
    return (
        <div>
            <Appbar />
            <div className="flex justify-center px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-5xl">
                    {/* Blog Content */}
                    <div className="lg:col-span-8">
                        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
                            {blog.title}
                        </div>
                        <div className="text-slate-500 pt-3 sm:pt-5 text-sm sm:text-base">
                            Posted on 2nd Dec 2023
                        </div>
                        <div className="pt-4 text-base sm:text-lg leading-relaxed">
                            {blog.content}
                        </div>
                    </div>

                    {/* Author Section */}
                    <div className="lg:col-span-4">
                        <div className="text-slate-600 text-lg sm:text-xl">
                            Author
                        </div>
                        <div className="flex items-start gap-4 pt-4">
                            <div>
                                <Avatar name={blog.author.name || "Anonymous"} size="big" />
                            </div>

                            <div>
                                <div className="text-xl font-bold">
                                    {blog.author.name || "Anonymous"}
                                </div>
                                <div className="pt-2 text-slate-500 text-sm sm:text-base">
                                    Random catchphrase about why he is better than rest of others and what is special about the author. Hahaha
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
