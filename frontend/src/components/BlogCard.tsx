interface BlogCardProps {
    authorName: string;
    title: string,
    content: string;
    publishedDate: string;
}
export const BlogCard = ({ authorName, title, content, publishedDate }: BlogCardProps) => {
    return <div>
        <div className="flex">
            <div className="flex justify-center flex-col">
                <Avatar name={authorName} />
            </div>

            <div className="font-normal pl-2">
                {authorName}
            </div>
            <div className="flex justify-center flex-col pl-2">
                <Circle />
            </div>
            <div className="pl-2 font-thin font-slate-500">
                {publishedDate}
            </div>
        </div>
            
        <div>
            {title}
        </div>
        <div>
            {content.slice(0, 100) + "..."}
        </div>
        <div>
            {`${Math.ceil(content.length / 100)} min read`}
        </div>
        <div className="bg-slate-200 h-1 w-full"></div>
    </div>

}

function Circle () { 
    return <div className="h-1 w-1 rounded-full bg-slate-400"></div>

}
function Avatar({ name }: { name: string }) {
    return <div className="relative inline-flex items-center justify-center w-6 h-6 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
        <span className="font-xs text-gray-600 dark:text-gray-300">{name[0].toUpperCase()}</span>
    </div>
}

