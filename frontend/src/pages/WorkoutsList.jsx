import WorkoutFeedFull from '../components/WorkoutFeedFull'
import { WorkoutProvider } from '../context/WorkoutContext'
import WorkoutCreationForm from '../components/forms/WorkoutCreationForm'
import { useState } from 'react'

const WorkoutsList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleOpenModal = () => setIsModalOpen(true)
    const handleCloseModal = () => {
        setIsModalOpen(false)
        setIsSubmitted(false)
    }


    return (
        <div className="pt-24 pb-20 flex flex-col items-center min-h-screen bg-[#8B0000] text-white">
            <h1 className="text-3xl font-bold text-yellow-400 mb-6">
                Your Workouts
            </h1>
            {/* ✅ Create Workout Button (hidden when form is open) */}
            {!isModalOpen && !isCreating && !isSubmitted && (
                <button
                    onClick={handleOpenModal}
                    className="bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition mt-6"
                >
                    Create Workout
                </button>
            )}

            {/* ✅ Show "Creating Workout" Status */}
            {isCreating && (
                <div className="w-full max-w-md bg-yellow-400 text-black text-center p-3 mb-4 mt-6 rounded-lg shadow-md">
                    Creating workout...
                </div>
            )}

            {/* ✅ Workout Creation Modal */}
            {isModalOpen && (
                <WorkoutCreationForm
                    onClose={handleCloseModal}
                    setIsCreating={setIsCreating}
                    setIsSubmitted={setIsSubmitted}
                />
            )}
            <WorkoutProvider>
                <WorkoutFeedFull />
            </WorkoutProvider>
        </div>
    )
}

export default WorkoutsList
