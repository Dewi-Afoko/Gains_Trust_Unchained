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

    // 🏋🏾‍♂️ State for workout and sets
    const [workout, setWorkout] = useState(null)
    const [sets, setSets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [restTime, setRestTime] = useState(0) // ⏳ Rest time for TimerLive
    const [timerKey, setTimerKey] = useState(0) // ✅ Forces Timer to reset

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

    // ⏳ Start the Rest Timer when a set is completed
    const startRestTimer = (time) => {
        console.log(`⏳ Starting rest timer: ${time} seconds`)
        setRestTime(time)
        setTimerKey((prev) => prev + 1) // ✅ Forces Timer component to re-render
    }

    return (
        <div className="min-h-screen bg-[#600000] text-white pt-24 px-6">
            {/* 🏋🏾‍♂️ Workout Header (Title, Date, Exit Button) */}
            <WorkoutHeaderLive workout={workout} />

            {/* ⏳ Live Tracking Layout */}
            <div className="flex justify-between items-start gap-6 mt-8">
                {/* ⏭ Next Five Sets (Only as wide as the heading, content centered) */}
                <div className="flex-shrink-0 min-w-[250px] text-center">
                    <SetTrackerLive
                        sets={sets}
                        workoutId={workoutId}
                        accessToken={accessToken}
                        onSetUpdated={handleSetUpdated}
                        startRestTimer={startRestTimer}
                        showNextOnly={true} // ✅ Pass a prop to filter Next Sets only
                    />
                </div>

                {/* 🔥 Timer (Now twice as wide, centered) */}
                <div className="flex-grow flex justify-center w-2/3">
                    <TimerLive
                        key={timerKey} // ✅ Forces re-render when a new set is completed
                        nextSet={sets.find((set) => !set.complete) || null}
                        restTime={restTime}
                        workoutId={workoutId}
                        accessToken={accessToken}
                        startRestTimer={startRestTimer}
                        onSetUpdated={handleSetUpdated}
                    />
                </div>

                {/* ✅ Last Five Completed Sets (Only as wide as the heading, content centered) */}
                <div className="flex-shrink-0 min-w-[250px] text-center">
                    <SetTrackerLive
                        sets={sets}
                        workoutId={workoutId}
                        accessToken={accessToken}
                        onSetUpdated={handleSetUpdated}
                        startRestTimer={startRestTimer}
                        showCompletedOnly={true} // ✅ Pass a prop to filter Completed Sets only
                    />
                </div>
            </div>

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
