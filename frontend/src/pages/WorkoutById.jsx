import { useParams } from 'react-router-dom'
import WorkoutDetailsFull from '../components/WorkoutDetailsFull'

const WorkoutById = () => {
    const { workout_id } = useParams() // ✅ Extract ID from URL params
    console.log('🛠 Extracted workoutId:', workout_id) // Debugging

    if (!workout_id) return <p>No workout selected.</p> // Handle missing ID

    return (
        <div className="pt-24 pb-20 flex flex-col items-center min-h-screen bg-[#8B0000] text-white">
            <WorkoutDetailsFull workoutId={workout_id} />
        </div>
    )
}

export default WorkoutById
