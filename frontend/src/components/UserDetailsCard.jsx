import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog'
import { useForm } from 'react-hook-form'
import { useContext, useState } from 'react'
import AuthContext from '../context/AuthContext'

const UserDetailsCard = ({ user }) => {
    const { setUser } = useContext(AuthContext) // Get global setUser function
    const { register, handleSubmit, setValue } = useForm()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isOpen, setIsOpen] = useState(false) // Track modal open state
    const [alert, setAlert] = useState(null) // Track success/error message

    // Pre-fill form with user data when modal opens
    const prefillForm = () => {
        setValue('first_name', user?.first_name || '')
        setValue('last_name', user?.last_name || '')
        setValue('height', user?.height || '')
        setValue('dob', user?.dob || '')
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/users/update_user/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: JSON.stringify(data),
                }
            )

            if (!response.ok) {
                throw new Error('Failed to update user details.')
            }

            setAlert({
                type: 'success',
                message: 'User details updated successfully! Refreshing...',
            })

            setTimeout(() => {
                setIsOpen(false) // Close modal first
            }, 500) // Short delay to ensure alert is visible

            setTimeout(() => {
                window.location.reload() // Refresh the page after 3 seconds
            }, 3000)
        } catch (error) {
            console.error(error)
            setAlert({
                type: 'error',
                message: 'Error updating details. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full flex flex-col items-center">
            {/* Alert Box for Success/Error Messages */}
            {alert && (
                <div
                    className={`w-full max-w-md text-center p-3 mb-4 rounded-lg shadow-md 
                    ${alert.type === 'success' ? 'bg-yellow-400 text-black' : 'bg-red-600 text-white'}`}
                >
                    {alert.message}
                </div>
            )}

            <Card className="w-full max-w-md bg-[#600000] border border-yellow-400 shadow-lg text-white">
                <CardHeader>
                    <CardTitle className="text-yellow-400">
                        User Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>
                        <strong>Username:</strong> {user?.username}
                    </p>
                    <p>
                        <strong>Date Joined:</strong>{' '}
                        {user?.date_joined || 'N/A'}
                    </p>
                    <p>
                        <strong>First Name:</strong> {user?.first_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Last Name:</strong> {user?.last_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Height:</strong> {user?.height || 'N/A'} cm
                    </p>
                    <p>
                        <strong>Date of Birth:</strong> {user?.dob || 'N/A'}
                    </p>
                    <p>
                        <strong>Last Login:</strong> {user?.last_login || 'N/A'}
                    </p>

                    {/* Edit Profile Button & Modal */}
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger
                            className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition"
                            onClick={() => {
                                prefillForm()
                                setIsOpen(true)
                            }}
                        >
                            Edit Profile
                        </DialogTrigger>
                        <DialogContent className="bg-[#600000] text-white p-6 rounded-lg shadow-lg max-w-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
                            <h3 className="text-lg font-semibold text-yellow-400">
                                Edit User Details
                            </h3>
                            <form
                                onSubmit={handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
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
                                    {isSubmitting
                                        ? 'Saving...'
                                        : 'Save Changes'}
                                </button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}

export default UserDetailsCard
