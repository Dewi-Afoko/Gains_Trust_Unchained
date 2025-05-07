import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog'
import { useAuthContext } from '../../providers/AuthContext'
import UserDetailsEditForm from './UserDetailsEditForm'
import { formatDateTime } from '../../utils/formatters'
import { deleteUser } from '../../api/usersApi'
import { useNavigate } from 'react-router-dom'

const UserDetailsCard = () => {
    const { user, accessToken, setUser, logout } = useAuthContext()
    const [updatedUser, setUpdatedUser] = useState(user)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const navigate = useNavigate()

    const handleUserUpdate = (newUserData) => {
        setUpdatedUser(newUserData) // Update local state so the UI re-renders
        setUser(newUserData) // Update the global auth state
        setIsModalOpen(false)
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            await deleteUser()
            logout()
            navigate('/')
        } catch (error) {
            alert('Failed to delete account. Please try again.')
        } finally {
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
        }
    }

    return (
        <div className="flex flex-col h-full w-full">
            <h2 className="text-brand-gold text-xl font-bold mb-4">User Details</h2>
            <div className="space-y-2">
                <p>
                    <strong>Username:</strong> {user?.username}
                </p>
                <p>
                    <strong>Date Joined:</strong>{' '}
                    {formatDateTime(user?.date_joined)}
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
                    <strong>Last Login:</strong>{' '}
                    {formatDateTime(user?.last_login)}
                </p>
            </div>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger className="bg-brand-gold text-black font-bold p-3 rounded-lg hover:bg-brand-red hover:text-white focus:ring-2 focus:ring-brand-red transition text-lg mt-4">
                    Edit Profile
                </DialogTrigger>
                <DialogContent>
                    <UserDetailsEditForm
                        user={updatedUser}
                        accessToken={accessToken}
                        onClose={() => setIsModalOpen(false)}
                        onUpdate={handleUserUpdate}
                    />
                </DialogContent>
            </Dialog>
            {/* Delete Account Button and Modal */}
            <button
                className="w-full bg-red-600 text-white font-bold p-3 rounded-lg hover:bg-red-800 focus:ring-2 focus:ring-red-800 transition text-lg mt-4"
                onClick={() => setIsDeleteModalOpen(true)}
            >
                Delete Account
            </button>
            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
                    <div className="bg-brand-dark-2 p-8 rounded-xl shadow-2xl border border-brand-gold max-w-md">
                        <h3 className="text-2xl font-bold text-brand-gold mb-4 text-center">
                            Confirm Account Deletion
                        </h3>
                        <p className="text-white mb-6 text-center">
                            Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-400 transition"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 px-4 py-2 rounded hover:bg-red-800 transition"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserDetailsCard
