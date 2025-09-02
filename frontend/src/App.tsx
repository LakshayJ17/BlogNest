import './App.css'
import { Signin } from './pages/Signin'
import { Signup } from './pages/Signup'
import { Blog } from './pages/Blog'
import { Blogs } from './pages/Blogs'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Publish } from './pages/Publish'
import Home from './pages/Home'
import { ToastContainer } from 'react-toastify'
import { useAuthStore } from './store/auth'
import { useEffect } from 'react'
import { Drafts } from './pages/Drafts'
import { ProfilePage } from './pages/Profile'
import { AdminDashboard } from './pages/AdminDashboard'


function App() {
  const { token, fetchUserData, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUserData()
    }
  }, [token, fetchUserData])

  if (isLoading){
    return <div>Loading...</div>
  }
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/blog/:id' element={<Blog />} />
          <Route
            path="/blogs"
            element={
              user?.role === "admin"
                ? <Navigate to="/admin-dashboard" replace />
                : <Blogs />
            }
          />
          <Route
            path="/publish"
            element={
              user?.role === "admin"
                ? <Navigate to="/admin-dashboard" replace />
                : <Publish />
            }
          />
          <Route
            path="/publish/:id"
            element={
              user?.role === "admin"
                ? <Navigate to="/admin-dashboard" replace />
                : <Publish />
            }
          />
          <Route
            path="/drafts"
            element={
              user?.role === "admin"
                ? <Navigate to="/admin-dashboard" replace />
                : <Drafts />
            }
          />
          <Route
            path="/profile"
            element={
              user?.role === "admin"
                ? <Navigate to="/admin-dashboard" replace />
                : <ProfilePage />
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              user?.role === "admin"
                ? <AdminDashboard />
                : <Navigate to="/" replace />
            }
          />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="!px-4 sm:!px-0 !mt-4 sm:!mt-0" />
    </>
  )
}

export default App
