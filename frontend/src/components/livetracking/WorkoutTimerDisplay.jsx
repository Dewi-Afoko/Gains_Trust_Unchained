const WorkoutTimerDisplay = ({ timeElapsed, workout }) => {
    const formatDuration = (seconds) => {
        const date = new Date(seconds * 1000);
        return date.toISOString().substr(11, 8); // ✅ Converts seconds to HH:MM:SS
    };

    return (
        <div className="text-yellow-400 font-bold text-xl text-center">
            {workout?.duration ? (
                <div className="flex flex-col items-center text-green-400 text-2xl font-extrabold mt-2">
                    <span className="text-3xl text-yellow-500"> Workout Complete!</span> 
                    <span className="mt-2 text-yellow-300 animate-pulse">Total Time: {formatDuration(workout.duration)}</span>
                </div>
            ) : (
                <span>⏱ Time Elapsed: {formatDuration(timeElapsed)}</span>
            )}
        </div>
    );
};

export default WorkoutTimerDisplay;
