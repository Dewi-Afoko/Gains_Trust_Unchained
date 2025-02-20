import axios from "axios";
import { useState } from "react";

const SetActionsLive = ({ setId, workoutId, accessToken, isNextSet, restTime, startRestTimer, onSetUpdated }) => {
    const [loading, setLoading] = useState(false);

    const handleComplete = async () => {
        if (!isNextSet) return; // ✅ Ensure only the next set is actionable
        setLoading(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/complete/`,
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            startRestTimer(restTime);
            onSetUpdated();
        } catch (error) {
            console.error("❌ Error marking set complete:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSkip = async () => {
        if (!isNextSet) return;
        setLoading(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/workouts/${workoutId}/sets/${setId}/skip/`,
                {},
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            onSetUpdated();
        } catch (error) {
            console.error("❌ Error skipping set:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-between mt-4">
            <button
                onClick={handleComplete}
                disabled={!isNextSet || loading}
                className={`px-4 py-2 rounded-xl font-bold text-white transition text-stroke ${
                    isNextSet ? "bg-[#222222] hover:bg-[#333333]" : "bg-gray-700 cursor-not-allowed"
                }`}
            >
                {loading ? "⏳ Processing..." : "🔥 Complete"}
            </button>
            <button
                onClick={handleSkip}
                disabled={!isNextSet || loading}
                className={`px-4 py-2 rounded-xl font-bold text-white transition text-stroke ${
                    isNextSet ? "bg-[#B22222] hover:bg-[#8B0000]" : "bg-gray-700 cursor-not-allowed"
                }`}
            >
                {loading ? "⏳ Processing..." : "⏭ Skip"}
            </button>
        </div>
    );
};

export default SetActionsLive;
