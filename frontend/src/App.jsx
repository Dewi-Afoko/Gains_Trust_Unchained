import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Register from './pages/Register'
import Login from './pages/Login'
import { useEffect, useState } from 'react'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        setIsLoggedIn(!!token) // Convert token existence to boolean
    }, [])
    return (
        <>
            <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/login"
                    element={<Login setIsLoggedIn={setIsLoggedIn} />}
                />{' '}
            </Routes>
            <Footer />
        </>
    )
}

export default App
