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
        <div className="text-center">
            {workout?.duration ? (
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                        <span className="text-3xl font-bold uppercase tracking-wider bg-gradient-to-b from-green-400 via-green-600 to-green-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                            Workout Complete!
                        </span>
                    </div>
                    <span className="mt-2 text-xl font-bold uppercase tracking-wider bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)] animate-pulse">
                        Total Time: {formatDuration(workout.duration)}
                    </span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-3">
                    <Clock className="w-6 h-6 text-yellow-400" />
                    <span className="text-xl font-bold uppercase tracking-wider bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 text-transparent bg-clip-text drop-shadow-[2px_2px_2px_rgba(0,0,0,0.8)]">
                        Time Elapsed: {formatDuration(safeTimeElapsed)}
                    </span>
                </div>
            )}
        </div>
    )
}

export default WorkoutTimerDisplay
