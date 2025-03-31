import { useParams } from "react-router-dom"
import { useBlog } from "../hooks"

export const Blog = () => {
    const { id } = useParams()
    const { loading, blog } = useBlog({
        id: id || ""
    })
    if (loading) {
        return <div>
            LOADING...
        </div>
    }
    return <div>
        Blog
    </div>
}