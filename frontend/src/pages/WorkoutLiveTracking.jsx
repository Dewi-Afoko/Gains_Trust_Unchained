import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import axios from 'axios'
import WorkoutHeaderLive from '../components/livetracking/WorkoutHeaderLive'
import TimerLive from '../components/livetracking/TimerLive'
import SetTrackerLive from '../components/livetracking/SetTrackerLive'
import WorkoutControlsLive from '../components/livetracking/WorkoutControlsLive'

const WorkoutLiveTracking = () => {
    const { accessToken } = useAuthContext()
    const { workoutId } = useParams()
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

    // 🏋️‍♂️ State for workout and sets
    const [workout, setWorkout] = useState(null)
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [restTime, setRestTime] = useState(0) // ⏳ Rest time for TimerLive

    // ✅ Fetch Workout & Sets on Load
    useEffect(() => {
        const fetchWorkoutData = async () => {
            try {
                console.log(`📡 Fetching workout ${workoutId}...`)
                const workoutResponse = await axios.get(
                    `${API_BASE_URL}/workouts/${workoutId}/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                )
                console.log('✅ Workout data:', workoutResponse.data)
                setWorkout(workoutResponse.data)

                console.log('✅ Fetching sets...')
                const setsResponse = await axios.get(
                    `${API_BASE_URL}/workouts/${workoutId}/sets/`,
                    { headers: { Authorization: `Bearer ${accessToken}` } }
                )
                console.log('✅ Sets received:', setsResponse.data.sets)
                setSets(setsResponse.data.sets || [])
            } catch (err) {
                console.error('❌ Error fetching workout data:', err)
                setError('Failed to load workout data.')
            } finally {
                setLoading(false)
            }
        }

        fetchWorkoutData()
    }, [workoutId, accessToken, API_BASE_URL])

    // ✅ Update sets when a change occurs
    const handleSetUpdated = async () => {
        try {
            console.log('🔄 Fetching updated sets...')
            const response = await axios.get(
                `${API_BASE_URL}/workouts/${workoutId}/sets/`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )
            console.log('✅ Updated sets received:', response.data.sets)
            setSets(response.data.sets || [])
        } catch (error) {
            console.error('❌ Error refreshing sets:', error)
        }
    }

    // ⏳ Start the Rest Timer when a set is completed (Ensures reliable updates)
    const startRestTimer = (time) => {
        console.log(`⏳ Starting rest timer: ${time} seconds`)
        setRestTime((prev) => (prev === 0 ? time : 0)) // ✅ Force a state change to trigger re-render
        setTimeout(() => setRestTime(time), 50) // ⏳ Prevents React from batching updates
    }

    if (loading) return <p className="text-white">Loading workout...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="min-h-screen bg-[#600000] text-white pt-20 px-6">
            {/* 🏋️‍♂️ Workout Header (Title, Date, Exit Button) */}
            <WorkoutHeaderLive workout={workout} />

            {/* ⏳ Timer Display */}
            <TimerLive
                nextSet={sets.find((set) => !set.complete) || null}
                restTime={restTime}
            />

            {/* ⏩ Next Five Sets & ✅ Last Five Completed */}
            <SetTrackerLive
                sets={sets}
                workoutId={workoutId}
                accessToken={accessToken}
                onSetUpdated={handleSetUpdated}
                startRestTimer={startRestTimer} // ✅ Pass Rest Timer Function
            />

            {/* 🔄 Full Set Overview (Editable) */}
            <WorkoutControlsLive
                sets={sets}
                workoutId={workoutId}
                accessToken={accessToken}
                onSetUpdated={handleSetUpdated}
            />
        </div>
    )
}

export default WorkoutLiveTracking
