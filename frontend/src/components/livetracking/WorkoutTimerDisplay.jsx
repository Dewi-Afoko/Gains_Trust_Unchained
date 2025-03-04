const WorkoutTimerDisplay = ({ timeElapsed }) => {


    return (
        <div className="text-yellow-400 font-bold text-xl">
            ⏱ Time Elapsed: {new Date(timeElapsed * 1000).toISOString().substr(11, 8)}
        </div>
    );
};

export default WorkoutTimerDisplay;
