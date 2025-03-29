import './App.css'
import { Signin } from './pages/Signin'
import { Signup } from './pages/Signup'
import { Blog } from './pages/Blog'
import { BrowserRouter, Routes, Route } from 'react-router-dom'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/signin' element={<Signin />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/blog/:id' element={<Blog />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
