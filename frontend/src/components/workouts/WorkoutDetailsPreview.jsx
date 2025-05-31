import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import useWorkoutStore from '../../stores/workoutStore'
import WorkoutEditForm from '../workouts/WorkoutEditForm'
import SetsTablePreview from '../sets/SetsTablePreview'
import SetCreationForm from '../sets/SetCreationForm'
import PanelButton from '../ui/PanelButton'
import PanelHeader from '../ui/PanelHeader'
import { Calendar, Clock, ClipboardList, Dumbbell } from 'lucide-react'

const Spinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
    </div>
)

// Icon wrapper component for consistent styling
const GradientIcon = ({ icon: Icon, className = "" }) => (
    <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1.5 shadow-lg">
        <Icon className={`w-5 h-5 stroke-[2.5px] text-black ${className}`} />
    </div>
)

const WorkoutDetailsPreview = ({ workoutId }) => {
    const { 
        workout, 
        sets, 
        loading,
        updateWorkout,
        fetchAllWorkouts,
        updateSetsFromAPI,
        fetchWorkoutDetails
    } = useWorkoutStore()
    
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)

    // Fetch workout details when workoutId changes
    useEffect(() => {
        if (workoutId) {
            fetchWorkoutDetails(workoutId)
        }
    }, [workoutId])

    const handleWorkoutUpdate = async (updatedWorkout) => {
        await updateWorkout(workoutId, updatedWorkout)
        fetchAllWorkouts()
        setIsEditModalOpen(false)
    }

    const handleSetAdded = async () => {
        await updateSetsFromAPI(workoutId)
        fetchAllWorkouts()
        setIsSetModalOpen(false)
    }

    // If no workout at all (first load or invalid), show not found
    if (!workout && !loading) {
        return (
            <div className="flex flex-1 items-center justify-center w-full h-full">
                <span className="text-brand-red font-bold tracking-wider uppercase">Workout not found.</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full relative bg-brand-dark-2 rounded-xl border border-brand-gold/30">
            {/* Spinner overlay while loading, but keep previous data visible */}
            {loading && <Spinner />}
            {workout && (
                <>
                    <PanelHeader 
                        title={workout?.workout_name || 'Loading Workout...'}
                        icon={Dumbbell}
                        useGainsFont={false}
                        size="large"
                    />
                    
                    <div className="flex flex-col h-full overflow-y-auto">
                        {/* Info Cards */}
                        <div className="grid grid-cols-3 gap-4 w-full px-4 py-3">
                            <div className="flex items-center justify-center space-x-3 bg-black/20 p-3 rounded-lg border border-brand-gold/30">
                                <GradientIcon icon={Calendar} />
                                <span className="text-gray-300 font-medium">
                                    {new Date(workout?.date).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-center space-x-3 bg-black/20 p-3 rounded-lg border border-brand-gold/30">
                                <GradientIcon icon={Clock} />
                                <span className="text-gray-300 font-medium">
                                    Duration: {workout?.duration || 'In Progress'}
                                </span>
                            </div>

                            <div className="flex items-center justify-center space-x-3 bg-black/20 p-3 rounded-lg border border-brand-gold/30">
                                <GradientIcon icon={ClipboardList} />
                                <span className="text-gray-300 font-medium truncate">
                                    {workout.notes || 'No notes'}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons - Centered */}
                        <div className="flex justify-center gap-4 mx-auto w-full max-w-2xl p-4">
                            <PanelButton
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-auto"
                            >
                                Edit Workout
                            </PanelButton>
                            <PanelButton
                                onClick={() => setIsSetModalOpen(true)}
                                className="w-auto"
                            >
                                Add Set
                            </PanelButton>
                        </div>

                        {/* Sets Table */}
                        <div className="w-full px-4 pb-4">
                            <SetsTablePreview sets={sets} workoutId={workoutId} />
                        </div>
                    </div>

                    {/* Edit Workout Modal using portal */}
                    {isEditModalOpen && createPortal(
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                            <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
                                <WorkoutEditForm
                                    workout={workout}
                                    workoutId={workoutId}
                                    onClose={() => setIsEditModalOpen(false)}
                                    onUpdate={handleWorkoutUpdate}
                                />
                            </div>
                        </div>,
                        document.body
                    )}

                    {/* Add Set Modal using portal */}
                    {isSetModalOpen && createPortal(
                        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
                            <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
                                <SetCreationForm
                                    workoutId={workoutId}
                                    onClose={() => setIsSetModalOpen(false)}
                                    onSetCreated={handleSetAdded}
                                />
                            </div>
                        </div>,
                        document.body
                    )}
                </>
            )}
        </div>
    )
}

export default WorkoutDetailsPreview
