export const BlogSkeleton = () => {
    return <div role="status" className="animate-pulse">
        <div className="p-4 border-b border-slate-200 pb-4 w-screen max-w-screen-md">
            <div className="flex">
                <div className="h-6 w-6 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>

            </div>

            <div className="pt-2">
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
            </div>
            <div className="pt-1">
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
            </div>
            <div className="text-slate-500 pt-1">
                <div className="h-2 bg-gray-200 rounded-full mb-2.5"></div>
            </div>
        </div>
        <span className="sr-only">Loading...</span>
    </div>


}