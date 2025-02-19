import SetsTableFull from '../sets/SetsTableFull'

const WorkoutControlsLive = ({
    sets,
    workoutId,
    accessToken,
    onSetUpdated,
}) => {
    // ✅ Filter Completed and Incomplete Sets
    const completedSets = sets.filter((set) => set.complete)
    const incompleteSets = sets.filter((set) => !set.complete)

    return (
        <div className="mt-6">
            {/* ⏳ Incomplete Sets Table */}
            <div className="bg-[#600000] border border-yellow-400 shadow-lg p-4 rounded-lg mb-6">
                <h3 className="text-yellow-400 font-bold text-lg mb-2">
                    Incomplete Sets
                </h3>
                <SetsTableFull
                    sets={incompleteSets}
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onSetUpdated={onSetUpdated}
                    hideCompleteColumn={true}
                />
            </div>

            {/* ✅ Completed Sets Table */}
            <div className="bg-[#400000] border border-green-500 shadow-lg p-4 rounded-lg">
                <h3 className="text-green-500 font-bold text-lg mb-2">
                    Completed Sets
                </h3>
                <SetsTableFull
                    sets={completedSets}
                    workoutId={workoutId}
                    accessToken={accessToken}
                    onSetUpdated={onSetUpdated}
                    hideCompleteColumn={true}
                />
            </div>
        </div>
    )
}

export default WorkoutControlsLive
