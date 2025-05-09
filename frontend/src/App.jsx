import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './components/ui/Navbar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import LandingPage from './pages/LandingPage'
import PrivateRoute from './components/auth/PrivateRoute'
import useAuthStore from './stores/authStore'

function App() {
    const { fetchUser } = useAuthStore()

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    return (
        <div className="min-h-screen bg-brand-dark">
            <Toaster richColors />
            <Navbar />
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </div>
    )
}

export default App
