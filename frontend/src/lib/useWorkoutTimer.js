import { useState, useEffect, useRef } from "react";

const useWorkoutTimer = () => {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeElapsed((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const startTimer = () => {
        setIsRunning(true);
    };

    const stopTimer = () => {
        setIsRunning(false);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeElapsed(0);
    };

    return {
        timeElapsed,
        isRunning,
        startTimer,
        stopTimer,
        resetTimer
    };
};

export default useWorkoutTimer;
