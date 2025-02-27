import { useNavigate } from 'react-router-dom';
import { useWorkoutContext } from '../../context/WorkoutContext'; // ✅ Use context

const WorkoutHeaderLive = () => {
    const { workout } = useWorkoutContext(); // ✅ Get workout from context
    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center bg-[#400000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg">
            <h2 className="text-yellow-400 text-3xl font-extrabold text-stroke">
                🏋🏾‍♂️ {workout?.workout_name || 'Live Workout'}
            </h2>
            <button
                onClick={() => navigate('/dashboard')}
                className="bg-[#8B0000] hover:bg-[#600000] text-white font-bold px-4 py-2 rounded-xl transition text-stroke"
            >
                ❌ Exit Workout
            </button>
        </div>
    );
};

export default WorkoutHeaderLive;
