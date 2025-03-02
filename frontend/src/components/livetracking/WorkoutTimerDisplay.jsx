import React from "react";

const WorkoutTimerDisplay = ({ timeElapsed }) => {
    // Format time as HH:MM:SS
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return [h, m, s]
            .map((unit) => String(unit).padStart(2, "0"))
            .join(":");
    };

    return (
        <div className="text-lg font-bold text-yellow-400">
        🕒 Time Elapsed: {formatTime(timeElapsed)}
        </div>
    );
};

export default WorkoutTimerDisplay;
