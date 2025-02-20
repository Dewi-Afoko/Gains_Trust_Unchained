import SetsTableFull from "../sets/SetsTableFull";

const WorkoutControlsLive = ({ workoutId, sets, accessToken, onSetUpdated }) => {
    return (
        <div className="bg-[#500000] text-white p-6 rounded-xl border border-yellow-400 shadow-lg mt-6">
            <h3 className="text-yellow-400 text-2xl font-extrabold text-stroke mb-4">
                📊 Workout Overview
            </h3>
            <SetsTableFull 
                sets={sets} 
                workoutId={workoutId} 
                accessToken={accessToken} 
                onSetUpdated={onSetUpdated} 
                hideCompleteColumn={true} // ✅ Hide "Complete" column in this view
            />
        </div>
    );
};

export default WorkoutControlsLive;
