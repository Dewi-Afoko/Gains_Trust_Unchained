import { useNavigate } from "react-router-dom";
import { useWorkoutContext } from "../../context/WorkoutContext"; // ✅ Use context
import WorkoutTimerDisplay from "./WorkoutTimerDisplay"; // ✅ Import timer display

const WorkoutOverview = ({ timeElapsed }) => {
    const { workout, completeSets, sets } = useWorkoutContext(); // ✅ Corrected context values
    const navigate = useNavigate();

    // ✅ Ensure progress updates dynamically
    const totalSets = sets.length;
    const completedCount = completeSets.length;
    const progress = totalSets > 0 ? (completedCount / totalSets) * 100 : 0;

    return (
        <div className="relative flex flex-col bg-[#400000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg">
            
            {/* ❌ Exit Workout (Top-Right) */}
            <button
                onClick={() => navigate("/dashboard")}
                className="absolute top-4 right-4 bg-[#8B0000] hover:bg-[#600000] text-white font-bold px-4 py-2 rounded-xl transition text-stroke"
            >
                ❌ Exit Workout
            </button>

            {/* 🏋🏾‍♂️ Centered Workout Title & Time Elapsed */}
            <div className="flex flex-col items-center mb-2"> {/* Reduced bottom margin */}
                <h2 className="text-yellow-400 text-3xl font-extrabold text-stroke text-center">
                    🏋🏾‍♂️ {workout?.workout_name || "Live Workout"}
                </h2>
                <WorkoutTimerDisplay timeElapsed={timeElapsed} />
            </div>

            {/* 📊 Workout Progress Bar (Fixed text positioning) */}
            <div className="relative w-full bg-gray-700 rounded-full h-6 mb-4">
                <div
                    className="bg-yellow-400 h-full rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                ></div>
                <span className="absolute inset-0 flex justify-center items-center text-sm font-bold text-yellow-400">
                    {Math.round(progress)}% Completed
                </span>
            </div>
        </div>
    );
};

export default WorkoutOverview;
