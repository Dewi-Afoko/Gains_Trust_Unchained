import { Routes, Route } from 'react-router-dom'
import Navbar from './components/ui/Navbar'
import Footer from './components/ui/Footer'
import { Toaster } from 'sonner'
import LandingPage from './pages/LandingPage'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { AuthProvider } from './providers/AuthContext'
import { WorkoutProvider } from './providers/WorkoutContext'

function App() {
    return (
        <AuthProvider>
            <WorkoutProvider>
                <Toaster unstyled position="top-right" />
                <Navbar />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
                <Footer />
            </WorkoutProvider>
        </AuthProvider>
    )
}

export default App
