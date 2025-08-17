import './App.css'
import { Signin } from './pages/Signin'
import { Signup } from './pages/Signup'
import { Blog } from './pages/Blog'
import { Blogs } from './pages/Blogs'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Publish } from './pages/Publish'
import Home from './pages/Home'
import { ToastContainer } from 'react-toastify'
import { useAuthStore } from './store/auth'
import { useEffect } from 'react'
import { Drafts } from './pages/Drafts'


function App() {
  const { token, fetchUserData } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUserData()
    }
  }, [token, fetchUserData])
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/blog/:id' element={<Blog />} />
          <Route path='/blogs' element={<Blogs />} />
          <Route path='/publish' element={<Publish />} />
          <Route path='/publish/:id' element={<Publish />} />
          <Route path='/drafts' element={<Drafts />} />
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
