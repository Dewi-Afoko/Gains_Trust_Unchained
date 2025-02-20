import { useState } from "react";
import SetEditForm from "../forms/SetEditForm";

const SetTrackerLive = ({ sets, workoutId, accessToken, startRestTimer, onSetUpdated, showNextOnly, showCompletedOnly }) => {
    const [editingSetId, setEditingSetId] = useState(null);

    let filteredSets = sets;

    // ✅ Only show Next Five Sets if `showNextOnly` is true
    if (showNextOnly) {
        filteredSets = sets.filter((set) => !set.complete).slice(0, 5);
    }

    // ✅ Only show Last Five Completed Sets if `showCompletedOnly` is true
    if (showCompletedOnly) {
        filteredSets = sets.filter((set) => set.complete).slice(-5).reverse();
    }

    return (
        <div className="bg-[#500000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg w-auto max-w-md">
            <h3 className="text-yellow-400 text-2xl font-extrabold text-stroke mb-3">
                {showNextOnly ? "⏭ Next 5 Sets" : "✅ Last 5 Completed Sets"}
            </h3>
            {filteredSets.length > 0 ? (
                <ul className="space-y-3 text-center">
                    {filteredSets.map((set) => (
                        <li key={set.id} className="p-3 bg-[#600000] border border-yellow-400 rounded-lg shadow-md min-w-[250px] max-w-full group hover:scale-105 transition-transform duration-200">
                            <p className="text-lg text-yellow-300 font-bold">{set.exercise_name}</p>
                            <p className="text-sm text-yellow-400">🔢 Sequence: {set.set_order}</p>
                            <p className="text-sm text-gray-300">🔥 Loading: {set.loading}kg</p>
                            <p className="text-sm text-gray-300">💪🏾 Reps: {set.reps}</p>
                            <p className="text-sm text-gray-300">⏳ Rest: {set.rest}s</p>
                            <button
                                onClick={() => setEditingSetId(set.id)}
                                className="mt-2 bg-yellow-500 text-black font-bold px-3 py-1 rounded hover:bg-yellow-400 transition w-full"
                            >
                                ✏️ Edit
                            </button>
                        </li>
                    ))}
                </ul>

            ) : (
                <p className="text-gray-400 text-center">{showNextOnly ? "No upcoming sets." : "No completed sets."}</p>
            )}

            {editingSetId && (
                <SetEditForm
                    workoutId={workoutId}
                    setId={editingSetId}
                    accessToken={accessToken}
                    onClose={() => setEditingSetId(null)}
                    onUpdate={onSetUpdated}
                />
            )}
        </div>
    );
};

export default SetTrackerLive;
