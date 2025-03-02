import { useState, useEffect, useRef } from "react";

let globalIsRunning = false; // ✅ Ensures one shared timer state
let globalTimeElapsed = 0;
let globalSetters = [];

const useWorkoutTimer = () => {
    const [timeElapsed, setTimeElapsed] = useState(globalTimeElapsed);
    const [isRunning, setIsRunning] = useState(globalIsRunning);
    const intervalRef = useRef(null);

    // ✅ Ensures components share the same timer instance
    useEffect(() => {
        globalSetters.push(setTimeElapsed);

        return () => {
            globalSetters = globalSetters.filter(setter => setter !== setTimeElapsed);
        };
    }, []);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                globalTimeElapsed += 1;
                globalSetters.forEach(setter => setter(globalTimeElapsed));
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const startTimer = () => {
        if (!globalIsRunning) {
            console.log("▶ Timer Started");
            globalIsRunning = true;
            setIsRunning(true);
        }
    };

    const stopTimer = () => {
        console.log("⏹ Timer Stopped");
        globalIsRunning = false;
        setIsRunning(false);
        clearInterval(intervalRef.current);
    };

    return {
        timeElapsed,
        isRunning,
        startTimer,
        stopTimer
    };
};

export default useWorkoutTimer;
