import { useNavigate } from 'react-router-dom'

const WorkoutHeaderLive = ({ workout }) => {
    const navigate = useNavigate()

    return (
        <div className="flex justify-between items-center bg-[#600000] text-white p-4 rounded-t-lg shadow-md">
            <h2 className="text-xl font-bold text-yellow-400">
                {workout?.workout_name || 'Live Workout'}
            </h2>
            <button
                onClick={() => navigate('/dashboard')}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
            >
                Exit Workout
            </button>
        </div>
    )
}

export default WorkoutHeaderLive
