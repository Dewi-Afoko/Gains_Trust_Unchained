import { useState, useEffect } from "react";
import { useWorkoutContext } from "../context/WorkoutContext"; // ✅ Use global workout state
import { differenceInSeconds } from "date-fns";
import useInterval from "./useInterval";

const useWorkoutTimer = () => {
    const { workout } = useWorkoutContext(); // ✅ Get workout data from context
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    console.log("⏳ useWorkoutTimer: isRunning updated:", isRunning);


    // ✅ Update `isRunning` dynamically when `start_time` changes
    useEffect(() => {
        if (workout?.start_time) {
            const startTime = new Date(workout.start_time);
            const elapsed = differenceInSeconds(new Date(), startTime);
            setTimeElapsed(elapsed);
            setIsRunning(true); // ✅ Ensure it updates when `workout.start_time` is set
        } else {
            setTimeElapsed(0); // ✅ Reset if no `start_time`
            setIsRunning(false);
        }
    }, [workout?.start_time]);

    // ✅ Keep timer updating every second
    useInterval(() => {
        if (isRunning) {
            setTimeElapsed((prev) => prev + 1);
        }
    }, isRunning ? 1000 : null); // ✅ Stop interval when workout isn't running

    return {
        timeElapsed,
        isRunning,
    };
};

export default useWorkoutTimer;
