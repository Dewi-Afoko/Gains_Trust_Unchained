import { useState } from 'react'
import { createPortal } from 'react-dom'
import useWorkoutStore from '../../stores/workoutStore'
import SetEditForm from '../sets/SetEditForm'
import PanelButton from '../ui/PanelButton'

const SetActionsLive = ({ set, onStartRest }) => {
    const { toggleSetComplete, skipSet } = useWorkoutStore()
    const [isEditing, setIsEditing] = useState(false)

    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {/* Complete/Skip Button */}
            <PanelButton
                onClick={() => toggleSetComplete(set.id)}
                className={`w-auto px-3 py-1 text-sm ${set.complete ? 'bg-green-600 hover:bg-green-700 text-black' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
                {set.complete ? '💪🏾' : '⏳'}
            </PanelButton>

            {/* Skip Button */}
            <PanelButton
                onClick={() => skipSet(set.id)}
                className="w-auto px-3 py-1 text-sm bg-yellow-600 hover:bg-yellow-700 text-black"
            >
                ⏭️ Skip
            </PanelButton>

            {/* Edit Button */}
            <PanelButton
                onClick={() => setIsEditing(true)}
                className="w-auto px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white"
            >
                ✏️ Edit
            </PanelButton>

            {/* Start Rest Timer Button */}
            {set.rest && (
                <PanelButton
                    onClick={() => onStartRest(set.rest)}
                    className="w-auto px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 text-white"
                >
                    ⏲️ Start Rest ({set.rest}s)
                </PanelButton>
            )}

            {/* Edit Modal using portal */}
            {isEditing &&
                createPortal(
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                        <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
                            <SetEditForm
                                setId={set.id}
                                onClose={() => setIsEditing(false)}
                            />
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    )
}

export default SetActionsLive
