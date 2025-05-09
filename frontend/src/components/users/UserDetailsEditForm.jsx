import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { showToast } from '../../utils/toast'
import { updateUser } from '../../api/usersApi'
import useAuthStore from '../../stores/authStore'

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
            const updatedUser = await updateUser(data)
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
        <div className="bg-brand-dark-2 text-white p-8 rounded-xl shadow-2xl border border-brand-gold max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <h3 className="text-2xl font-bold text-brand-gold mb-6 text-center">
                Edit User Details
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <label className="block">
                    <span className="text-brand-gold font-semibold">
                        First Name:
                    </span>
                    <input
                        {...register('first_name')}
                        className="w-full p-2 mt-1 rounded bg-brand-dark-1 border border-brand-gold text-white focus:ring-2 focus:ring-brand-red focus:border-brand-red transition"
                    />
                </label>
                <label className="block">
                    <span className="text-brand-gold font-semibold">
                        Last Name:
                    </span>
                    <input
                        {...register('last_name')}
                        className="w-full p-2 mt-1 rounded bg-brand-dark-1 border border-brand-gold text-white focus:ring-2 focus:ring-brand-red focus:border-brand-red transition"
                    />
                </label>
                <label className="block">
                    <span className="text-brand-gold font-semibold">
                        Height (cm):
                    </span>
                    <input
                        type="number"
                        {...register('height')}
                        className="w-full p-2 mt-1 rounded bg-brand-dark-1 border border-brand-gold text-white focus:ring-2 focus:ring-brand-red focus:border-brand-red transition"
                    />
                </label>
                <label className="block">
                    <span className="text-brand-gold font-semibold">
                        Date of Birth:
                    </span>
                    <input
                        type="date"
                        {...register('dob')}
                        className="w-full p-2 mt-1 rounded bg-brand-dark-1 border border-brand-gold text-white focus:ring-2 focus:ring-brand-red focus:border-brand-red transition"
                    />
                </label>

                <button
                    type="submit"
                    className="w-full bg-brand-gold text-black font-bold p-3 rounded-lg hover:bg-brand-red hover:text-white focus:ring-2 focus:ring-brand-red transition text-lg mt-4"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

export default UserDetailsEditForm
