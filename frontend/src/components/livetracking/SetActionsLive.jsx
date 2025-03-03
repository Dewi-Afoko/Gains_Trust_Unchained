import { useState, useEffect } from "react";
import { useWorkoutContext } from "../../context/WorkoutContext"; // ✅ Keep context
import useWorkoutTimer from "../../lib/useWorkoutTimer"; // ✅ Get timer state

const SetActionsLive = ({ setId, isNextSet, restTime, startRestTimer }) => {
    const { workoutId, workout, toggleSetComplete, skipSet, startWorkout } = useWorkoutContext(); // ✅ Include workout
    const { isRunning } = useWorkoutTimer(); // ✅ Get timer state
    const [loading, setLoading] = useState(false);
    const [renderKey, setRenderKey] = useState(0); // ✅ Force re-render when `isRunning` changes
    console.log("🔥 isRunning in SetActionsLive:", isRunning);

    // ✅ Force re-render when `workout.start_time` updates
    useEffect(() => {
        setRenderKey((prevKey) => prevKey + 1);
    }, [isRunning, workout?.start_time]);

    const handleComplete = async () => {
        if (!isNextSet || !isRunning) return; // ✅ Prevent if not the next set or timer inactive
        setLoading(true);

        console.log("🟢 Completing set. Set ID:", setId); // ✅ Debugging log

        if (!setId) {
            console.error("❌ ERROR: Attempted to complete a set with an undefined setId.");
            setLoading(false);
            return;
        }

        try {
            await toggleSetComplete(setId);
            startRestTimer(restTime);
        } catch (error) {
            console.error("❌ Error marking set complete:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        if (!isNextSet || !isRunning) return; // ✅ Prevent if not the next set or timer inactive
        setLoading(true);

        console.log("⚠️ Skipping set. Set ID:", setId); // ✅ Debugging log

        if (!setId) {
            console.error("❌ ERROR: Attempted to skip a set with an undefined setId.");
            setLoading(false);
            return;
        }

        try {
            await skipSet(setId);
        } catch (error) {
            console.error("❌ Error skipping set:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div key={renderKey} className="relative flex flex-col items-center mt-6 w-full">
            {/* 🔥 Complete Button - Replaced with Start Workout if Timer Not Started */}
            {!isRunning ? (
                <button
                    onClick={() => startWorkout(workoutId)} // ✅ Fix: Now runs only on click
                    className="px-6 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition text-stroke"
                >
                    ▶ Start Workout
                </button>
            ) : (
                <button
                    onClick={handleComplete}
                    disabled={!isNextSet || loading}
                    className={`px-6 py-3 rounded-xl font-bold text-white transition text-stroke ${
                        isNextSet
                            ? "bg-[#600000] hover:bg-[#8B0000]" // ✅ Dark red complete button (theme-matching)
                            : "bg-gray-700 cursor-not-allowed"
                    }`}
                >
                    {loading ? "⏳ Processing..." : "🔥 Complete"}
                </button>
            )}

            {/* ⏭ Skip Button - Bottom Right */}
            <div className="absolute bottom-0 right-0">
                <button
                    onClick={handleSkip}
                    disabled={!isNextSet || !isRunning || loading}
                    className={`px-4 py-2 rounded-xl font-bold text-white transition text-stroke ${
                        isNextSet && isRunning
                            ? "bg-[#B22222] hover:bg-[#8B0000]" // ✅ Deep red skip button (theme-matching)
                            : "bg-gray-700 cursor-not-allowed"
                    }`}
                >
                    {loading ? "⏳ Processing..." : "⏭ Skip"}
                </button>
            </div>
        </div>
    );
};

export default SetActionsLive;
