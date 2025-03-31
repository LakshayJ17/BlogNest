interface BlogCardProps {
    authorName: string;
    title: string,
    content: string;
    publishedDate: string;
}
export const BlogCard = ({ authorName, title, content, publishedDate }: BlogCardProps) => {
    return <div className="p-4 border-b border-slate-200  pb-4">
        <div className="flex">
            <Avatar name={authorName} />
            <div className="font-normal pl-2 text-sm flex justify-center flex-col">
                {authorName}
            </div>
            <div className="flex justify-center flex-col pl-2 flex justify-center flex-col">
                <Circle />
            </div>
            <div className="pl-2 font-thin font-slate-500 text-sm flex justify-center flex-col">
                {publishedDate}
            </div>
        </div>

        <div className="font-semibold text-xl pt-2">
            {title}
        </div>
        <div className="text-md font-thin pt-1">
            {content.slice(0, 100) + "..."}
        </div>
        <div className="text-slate-400 text-sm font-thin pt-1">
            {`${Math.ceil(content.length / 100)} min(s) read`}
        </div>
    </div>

}

function Circle() {
    return <div className="h-1 w-1 rounded-full bg-slate-400"></div>

}
function Avatar({ name }: { name: string }) {
    return <div className="relative inline-flex items-center justify-center w-6 h-6 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
        <span className="font-xs text-gray-600 dark:text-gray-300">{name[0].toUpperCase()}</span>
    </div>
}

