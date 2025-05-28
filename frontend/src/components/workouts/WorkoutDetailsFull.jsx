import React, { useState, useEffect } from 'react'
import useWorkoutStore from '../../stores/workoutStore'
import WorkoutEditForm from './WorkoutEditForm'
import SetsTableFull from '../sets/SetsTableFull'
import SetCreationForm from '../sets/SetCreationForm'
import LoadingSpinner from '../ui/LoadingSpinner'
import { useNavigate, useParams } from 'react-router-dom'
import PanelHeader from '../ui/PanelHeader'
import PanelButton from '../ui/PanelButton'
import { 
    Edit,
    Plus,
    Play,
    CheckCircle2,
    Clock,
    Activity,
    Calendar,
    FileText,
    Dumbbell,
    ClipboardList
} from 'lucide-react'
import texture2 from '../../assets/texture2.png'

// Spinner component for loading states
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

// Helper function to determine workout status
const getWorkoutStatus = (workout) => {
    if (!workout) return 'N/A'
    if (workout.duration) {
        const hours = Math.floor(workout.duration / 3600)
        const minutes = Math.floor((workout.duration % 3600) / 60)
        const seconds = workout.duration % 60
        let timeStr = ''
        if (hours > 0) {
            timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        } else {
            timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
        }
        return `Completed in ${timeStr}`
    }
    if (workout.start_time) {
        return 'In Progress'
    }
    return 'Not Started'
}

const WorkoutDetailsFull = () => {
    const { workoutId } = useParams()
    const navigate = useNavigate()
    const {
        workout,
        loading,
        error,
        fetchWorkoutDetails,
        updateWorkout,
        toggleComplete,
        startWorkout,
    } = useWorkoutStore()

    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false)
    const [isSetModalOpen, setIsSetModalOpen] = useState(false)

    useEffect(() => {
        if (workoutId) {
            fetchWorkoutDetails(workoutId)
        }
    }, [workoutId])

    const handleWorkoutUpdate = async (updatedWorkout) => {
        await updateWorkout(workoutId, updatedWorkout)
        setIsWorkoutModalOpen(false)
    }

    const handleSetUpdated = () => {
        setIsSetModalOpen(false)
        fetchWorkoutDetails(workoutId)
    }

    if (error) {
        return (
            <div className="w-full relative min-h-[200px] overflow-hidden rounded-xl border border-red-500/50">
                {/* Background Texture */}
                <div
                    className="absolute inset-0 opacity-40 pointer-events-none z-0 rounded-xl"
                    style={{ 
                        backgroundImage: `url(${texture2})`,
                        backgroundSize: '500px 500px',
                        backgroundRepeat: 'repeat',
                        backgroundAttachment: 'scroll',
                        backgroundPosition: 'center center'
                    }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-900/60 via-red-800/80 to-red-900/90 rounded-xl z-10"></div>
                
                {/* Content */}
                <div className="relative z-20 text-center text-red-400 p-4 flex items-center justify-center h-full">
                    <div>
                        <h2 className="font-bold uppercase tracking-wider">Error loading workout</h2>
                        <p className="font-medium">{error}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!workout && !loading) {
        return (
            <div className="flex flex-1 items-center justify-center w-full h-full min-h-[200px]">
                <span className="text-brand-red font-bold tracking-wider uppercase">Workout not found.</span>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full relative bg-brand-dark-2/80 backdrop-blur-sm rounded-xl border border-brand-gold/30 overflow-hidden">
            {/* Background Texture */}
            <div
                className="absolute inset-0 opacity-40 pointer-events-none z-0"
                style={{ 
                    backgroundImage: `url(${texture2})`,
                    backgroundSize: '500px 500px',
                    backgroundRepeat: 'repeat',
                    backgroundAttachment: 'scroll',
                    backgroundPosition: 'center center'
                }}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-900/20 via-black/80 to-black/90 z-10"></div>
            
            {/* Content */}
            <div className="relative z-20 flex flex-col h-full">
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
                                        {workout?.date ? new Date(workout.date).toLocaleDateString() : 'No date set'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-center space-x-3 bg-black/20 p-3 rounded-lg border border-brand-gold/30">
                                    <GradientIcon icon={Clock} />
                                    <span className="text-gray-300 font-medium">
                                        Status: {getWorkoutStatus(workout)}
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
                            <div className="flex justify-center gap-4 mx-auto w-full max-w-4xl p-4">
                                <PanelButton
                                    onClick={() => setIsWorkoutModalOpen(true)}
                                    className="w-auto flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Workout
                                </PanelButton>
                                <PanelButton
                                    onClick={() => setIsSetModalOpen(true)}
                                    className="w-auto flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Set
                                </PanelButton>
                            </div>

                            {/* Sets Table */}
                            <div className="w-full px-4 pb-4">
                                <SetsTableFull hideCompleteButton={true} />
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modals */}
            {isWorkoutModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4 shadow-lg">
                        <WorkoutEditForm
                            workout={workout}
                            workoutId={workoutId}
                            onClose={() => setIsWorkoutModalOpen(false)}
                            onUpdate={handleWorkoutUpdate}
                        />
                    </div>
                </div>
            )}

            {isSetModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-brand-dark-2/90 backdrop-blur-sm p-6 rounded-xl border border-brand-gold/30 w-full max-w-2xl mx-4 shadow-lg">
                        <SetCreationForm
                            workoutId={workoutId}
                            onClose={() => setIsSetModalOpen(false)}
                            onSetCreated={handleSetUpdated}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default WorkoutDetailsFull
