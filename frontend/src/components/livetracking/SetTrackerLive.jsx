import SetActionsLive from './SetActionsLive'

const SetTrackerLive = ({
    sets,
    workoutId,
    accessToken,
    onSetUpdated,
    startRestTimer,
}) => {
    const nextSets = sets.filter((set) => !set.complete).slice(0, 5)
    const lastSets = sets.filter((set) => set.complete).slice(-5)

    return (
        <div className="grid grid-cols-2 gap-4">
            {/* ✅ Next 5 Incomplete Sets */}
            <div className="bg-[#600000] p-4 rounded shadow-md border border-yellow-400">
                <h2 className="text-yellow-400 text-lg font-bold mb-3">
                    Next 5 Sets
                </h2>
                <ul>
                    {nextSets.length > 0 ? (
                        nextSets.map((set, index) => (
                            <li
                                key={set.id}
                                className="flex justify-between items-center text-white p-2 border-b border-yellow-400"
                            >
                                <span>
                                    {set.exercise_name} - {set.reps || '?'} reps
                                </span>
                                {index === 0 && ( // ✅ Only show buttons for the first set
                                    <SetActionsLive
                                        setId={set.id}
                                        workoutId={workoutId}
                                        accessToken={accessToken}
                                        isNextSet={true} // ✅ Only first set is marked as next
                                        restTime={set.rest}
                                        startRestTimer={startRestTimer}
                                        onSetUpdated={onSetUpdated}
                                    />
                                )}
                            </li>
                        ))
                    ) : (
                        <p className="text-yellow-400">No upcoming sets</p>
                    )}
                </ul>
            </div>

            {/* ✅ Last 5 Completed Sets */}
            <div className="bg-[#600000] p-4 rounded shadow-md border border-yellow-400">
                <h2 className="text-yellow-400 text-lg font-bold mb-3">
                    Last 5 Completed
                </h2>
                <ul>
                    {lastSets.length > 0 ? (
                        lastSets.map((set) => (
                            <li
                                key={set.id}
                                className="text-white p-2 border-b border-yellow-400"
                            >
                                {set.exercise_name} - {set.reps || '?'} reps
                            </li>
                        ))
                    ) : (
                        <p className="text-yellow-400">No completed sets</p>
                    )}
                </ul>
            </div>
        </div>
    )
}

export default SetTrackerLive
