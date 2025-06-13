import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { showToast } from '../../utils/toast'
import { updateUser } from '../../api/usersApi'
import useAuthStore from '../../stores/authStore'
import PanelButton from '../ui/PanelButton'

const UserDetailsEditForm = ({ user, onClose, onUpdate }) => {
    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // When the user prop changes, we pre-fill the form fields with the latest user data.
    useEffect(() => {
        if (user) {
            setValue('first_name', user.first_name || '')
            setValue('last_name', user.last_name || '')
            setValue('height', user.height || '')
            setValue('dob', user.dob || '')
        }
    }, [user, setValue])

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const updatedFields = {
                first_name: data.first_name.trim() || '',
                last_name: data.last_name.trim() || '',
                height: data.height !== '' ? parseFloat(data.height) : null,
                dob: data.dob || null,
            }

            const updatedUser = await updateUser(updatedFields)
            onUpdate(updatedUser) // Notify the parent to re-render with the new user

            showToast('User details updated successfully!', 'success')
            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (error) {
            showToast('Error updating details. Please try again.', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <h3 className="text-2xl font-bold text-brand-gold mb-6 text-center tracking-wide">
                Edit User Details
            </h3>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
            >
                {/* First Name + Last Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        First Name:
                        <input
                            {...register('first_name')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                            placeholder="Enter your first name"
                        />
                    </label>
                    <label className="block text-brand-gold font-semibold mb-1">
                        Last Name:
                        <input
                            {...register('last_name')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                            placeholder="Enter your last name"
                        />
                    </label>
                </div>

                {/* Height + Date of Birth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block text-brand-gold font-semibold mb-1">
                        Height (cm):
                        <input
                            type="number"
                            step="0.1"
                            {...register('height')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                            placeholder="Enter your height in cm"
                        />
                    </label>
                    <label className="block text-brand-gold font-semibold mb-1">
                        Date of Birth:
                        <input
                            type="date"
                            {...register('dob')}
                            className="w-full p-2 mt-2 rounded bg-[#1a1a1a] border border-yellow-400 text-white focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                        />
                    </label>
                </div>

                <div className="flex gap-4 pt-4 sticky bottom-0 bg-brand-dark-2 py-2 -mx-2 px-2">
                    <PanelButton
                        type="submit"
                        disabled={isSubmitting}
                        variant="gold"
                        className="flex-1"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </PanelButton>
                    <PanelButton
                        type="button"
                        onClick={onClose}
                        variant="danger"
                        className="flex-1"
                    >
                        Cancel
                    </PanelButton>
                </div>
            </form>
        </div>
    )
}

export default UserDetailsEditForm
