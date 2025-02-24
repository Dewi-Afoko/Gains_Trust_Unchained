import { useParams } from 'react-router-dom'
import WorkoutDetailsFull from '../components/WorkoutDetailsFull'
import { WorkoutProvider } from '../context/WorkoutContext'

const WorkoutById = () => {
    const { workout_id } = useParams() // ✅ Extract ID from URL params

    if (!workout_id) return <p>No workout selected.</p> // Handle missing ID

    return (
        <WorkoutProvider workoutId={workout_id}>
            <div className="pt-24 pb-20 flex flex-col items-center min-h-screen bg-[#8B0000] text-white">
                <WorkoutDetailsFull />
            </div>
        </WorkoutProvider>
    )
}

export default WorkoutById
