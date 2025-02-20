import { useState } from 'react'
import SetEditForm from '../forms/SetEditForm'

const SetTrackerLive = ({
    sets,
    workoutId,
    accessToken,
    startRestTimer,
    onSetUpdated,
    showNextOnly,
    showCompletedOnly,
}) => {
    const [editingSetId, setEditingSetId] = useState(null)
    const [isExpanded, setIsExpanded] = useState(true) // ✅ Open by default

    let filteredSets = sets

    // ✅ Only show Next Three Sets if `showNextOnly` is true
    if (showNextOnly) {
        filteredSets = sets.filter((set) => !set.complete).slice(0, 3)
    }

    // ✅ Only show Last Three Completed Sets if `showCompletedOnly` is true
    if (showCompletedOnly) {
        filteredSets = sets
            .filter((set) => set.complete)
            .slice(-3)
            .reverse()
    }

    return (
        <div className="bg-[#500000] text-white p-4 rounded-xl border border-yellow-400 shadow-lg w-auto max-w-md">
            <h3
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-yellow-400 text-2xl font-extrabold text-stroke mb-3 cursor-pointer hover:text-yellow-300 transition"
            >
                {showNextOnly ? 'Next 3 Sets' : 'Last 3 Sets'}{' '}
                {isExpanded ? '🔽' : '▶️'}
            </h3>

            {/* ✅ Collapsible Content */}
            <div
                className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}
            >
                {filteredSets.length > 0 ? (
                    <ul className="space-y-3 text-center">
                        {filteredSets.map((set) => (
                            <li
                                key={set.id}
                                className="p-3 bg-[#600000] border border-yellow-400 rounded-lg shadow-md min-w-[250px] max-w-full group hover:scale-105 transition-transform duration-200"
                            >
                                <p className="text-lg text-yellow-300 font-bold">
                                    {set.exercise_name}{' '}
                                    {set.set_type ? `- ${set.set_type}` : ''}
                                </p>
                                {set.focus && (
                                    <p className="text-sm text-gray-300">
                                        🧠 Focus: {set.focus}
                                    </p>
                                )}
                                {set.loading && (
                                    <p className="text-sm text-gray-300">
                                        🔥 Loading: {set.loading}kg
                                    </p>
                                )}
                                {set.reps && (
                                    <p className="text-sm text-gray-300">
                                        💪🏾 Reps: {set.reps}
                                    </p>
                                )}
                                {set.rest && (
                                    <p className="text-sm text-gray-300">
                                        ⏳ Rest: {set.rest}s
                                    </p>
                                )}
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
                    <p className="text-gray-400 text-center">
                        {showNextOnly
                            ? 'No upcoming sets.'
                            : 'No completed sets.'}
                    </p>
                )}
            </div>

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
    )
}

export default SetTrackerLive
