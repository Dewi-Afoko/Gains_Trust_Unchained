import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Navbar from './components/ui/Navbar'
import Footer from './components/ui/Footer'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import WorkoutById from './pages/WorkoutById'
import WorkoutsList from './pages/WorkoutsList'

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/workouts"
                    element={
                        <PrivateRoute>
                            <WorkoutsList />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/workouts/:workout_id/full"
                    element={
                        <PrivateRoute>
                            <WorkoutById />
                        </PrivateRoute>
                    }
                />
            </Routes>

            <Footer />
        </>
    )
}

export default App
