import axios from "axios"
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config"
import { useAuthStore } from "../store/auth";

export interface Blog {
    "content": string;
    "title": string;
    "id": string;
    "date": string;
    "author": {
        "name": string;
        "googleId"?: string;
        "avatar"?: string;
        "bio": string;
    };
    "labels": string[];
    "_count": {
        "likes": number;
    };

}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true)
    const [blog, setBlog] = useState<Blog>()
    const { token } = useAuthStore();

    useEffect(() => {
        if (!token) return
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log(response.data.post)
                setBlog(response.data.post)
                setLoading(false)
            })
    }, [id, token])

    return { loading, blog }
}

export const useBlogs = (search?: string, label?: string) => {
    const [loading, setLoading] = useState(true)
    const [blogs, setBlogs] = useState<Blog[]>([])

    const { token } = useAuthStore();

    useEffect(() => {
        if (!token) return;
        setLoading(true)

        const searchParams = new URLSearchParams();
        if (search && search.trim() !== "") searchParams.append("q", search);
        if (label && label.trim() !== "") searchParams.append("label", label);

        axios.get(`${BACKEND_URL}/api/v1/blog/bulk?${searchParams.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                setBlogs(response.data.posts)
                setLoading(false)
            })
    }, [token, search, label])

    return { loading, blogs }
}