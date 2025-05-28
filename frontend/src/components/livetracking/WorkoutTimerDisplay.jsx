import { Clock, CheckCircle2 } from 'lucide-react'

const WorkoutTimerDisplay = ({ timeElapsed, workout }) => {
    const formatDuration = (seconds) => {
        // Handle invalid input
        if (!seconds || seconds < 0 || isNaN(seconds)) {
            return '00:00:00'
        }
        
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const remainingSeconds = seconds % 60
        
        const pad = (num) => String(num).padStart(2, '0')
        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
    }

    // Ensure timeElapsed has a default value
    const safeTimeElapsed = timeElapsed || 0

    return (
        <div className="text-yellow-400 font-bold text-xl text-center">
            {workout?.duration ? (
                <div className="flex flex-col items-center text-green-400 text-2xl font-extrabold mt-2">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                        <span className="text-3xl text-yellow-500">
                            Workout Complete!
                        </span>
                    </div>
                    <span className="mt-2 text-yellow-300 animate-pulse">
                        Total Time: {formatDuration(workout.duration)}
                    </span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-400" />
                    <span>Time Elapsed: {formatDuration(safeTimeElapsed)}</span>
                </div>
            )}
        </div>
    )
}

export default WorkoutTimerDisplay
