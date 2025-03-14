import { useState, useEffect, useContext } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import AuthContext from '../../providers/AuthContext'
import { Toaster, toast } from 'react-hot-toast'

const UserDetailsEditForm = ({ user, accessToken, onClose, onUpdate }) => {
    const { setUser } = useContext(AuthContext)
    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // ✅ Auto-populate form fields
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
            const response = await axios.patch(
                `${process.env.REACT_APP_API_BASE_URL}/users/update_user/`,
                data,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            )

            const updatedUser = response.data.user
            setUser(updatedUser) // ✅ Update user globally in AuthContext
            onUpdate(updatedUser) // ✅ Trigger re-render in UserDetailsCard

            toast.success('User details updated successfully!') // ✅ Show success toast
            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (error) {
            toast.error('Error updating details. Please try again.') // ✅ Show error toast
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
            <Toaster />
            <h3 className="text-lg font-semibold text-yellow-400">
                Edit User Details
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <label className="block">
                    First Name:
                    <input
                        {...register('first_name')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Last Name:
                    <input
                        {...register('last_name')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Height (cm):
                    <input
                        type="number"
                        {...register('height')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>
                <label className="block">
                    Date of Birth:
                    <input
                        type="date"
                        {...register('dob')}
                        className="w-full p-2 mt-1 rounded text-black"
                    />
                </label>

                <button
                    type="submit"
                    className="w-full bg-yellow-400 text-black font-bold p-2 rounded hover:bg-yellow-300"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}

export default UserDetailsEditForm
