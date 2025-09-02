import { useAuthStore } from "../store/auth"
import { useEffect, useState } from "react";
import { Appbar } from "../components/Appbar";
import { Unauthorized } from "../components/Unauthorized";
import axios from "axios";
import { BACKEND_URL } from "../config";

export const AdminDashboard = () => {
    const { user, token } = useAuthStore();
    const [stats, setStats] = useState<{ totalUsers: number; totalBlogs: number }>({
        totalUsers: 0,
        totalBlogs: 0
    })

    useEffect(() => {
        if (user?.role === "admin"){
            axios.get(`${BACKEND_URL}/api/v1/admin/all-details`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(res => setStats(res.data))
                .catch(() => setStats({ totalUsers: 0, totalBlogs: 0 }))
        }
    }, [token,user?.role]);

    if (user?.role != "admin") {
        return <Unauthorized />
    }

    return <>
        <Appbar
            navigateTo="/admin-dashboard"
            label="BlogNest"
        />
        <div>
            Welcome BlogNest Admin
        </div>

        <div>
            <div>
                Total Users : {stats.totalUsers}
            </div>
            <div>
                Total posts : {stats.totalBlogs}
            </div>
        </div>

        <div>
            Posts to be reviewed
        </div>
    </>
}