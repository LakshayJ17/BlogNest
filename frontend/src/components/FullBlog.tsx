import { Blog } from "../hooks";
import { useLike } from "../hooks/useLike";
import { Appbar } from "./Appbar";
import { BackButton } from "./BackButton";
import { Avatar } from "./BlogCard";
import { LikeButton } from "./LikeButton";
import { PostedDate } from "./PostedDate";

export const FullBlog = ({ blog }: { blog: Blog }) => {
    const { liked, likes, toggleLike } = useLike(blog.id, blog._count.likes);

    return (
        <div>
            <Appbar navigateTo="/blogs" label={<BackButton />} />
            <div className="flex justify-center px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-5xl">
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
                    
                    <div className="lg:col-span-4">
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
                </div>
            </div>
        </div>
    );
};
