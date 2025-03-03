import { useEffect, useState } from "react";

const WorkoutTimerDisplay = ({ timeElapsed }) => {
    const [displayTime, setDisplayTime] = useState(timeElapsed);

    useEffect(() => {
        setDisplayTime(timeElapsed); // ✅ Update display time when `timeElapsed` changes
    }, [timeElapsed]);

    return (
        <div className="text-yellow-400 font-bold text-xl">
            ⏱ Time Elapsed: {new Date(displayTime * 1000).toISOString().substr(11, 8)}
        </div>
    );
};

export default WorkoutTimerDisplay;
