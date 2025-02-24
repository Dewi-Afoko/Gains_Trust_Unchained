import WorkoutFeedFull from '../components/WorkoutFeedFull'
import { WorkoutProvider } from '../context/WorkoutContext'

const WorkoutsList = () => {
    return (
        <div className="pt-24 pb-20 flex flex-col items-center min-h-screen bg-[#8B0000] text-white">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">
                Your Workouts
            </h1>
            <WorkoutProvider>
                <WorkoutFeedFull />
            </WorkoutProvider>
        </div>
    )
}

export default WorkoutsList
