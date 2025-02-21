import { useState, useContext } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog'
import AuthContext from '../context/AuthContext'
import UserDetailsEditForm from '../components/forms/UserDetailsEditForm'
import { formatDateTime } from '../lib/utils'

const UserDetailsCard = ({ user }) => {
    const { accessToken, setUser } = useContext(AuthContext) // ✅ Added setUser from AuthContext
    const [updatedUser, setUpdatedUser] = useState(user) // ✅ Track updates
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleUserUpdate = (newUserData) => {
        setUpdatedUser(newUserData) // ✅ Update local state to re-render UI
        setUser(newUserData) // ✅ Update global auth state
        setIsModalOpen(false)
    }

    return (
        <div className="w-full flex flex-col items-center">
            <Card className="w-full max-w-md bg-[#600000] border border-yellow-400 shadow-lg text-white">
                <CardHeader>
                    <CardTitle className="text-yellow-400">
                        User Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p>
                        <strong>Username:</strong> {updatedUser?.username}
                    </p>
                    <p>
                        <strong>Date Joined:</strong>{' '}
                        {formatDateTime(updatedUser?.date_joined)}
                    </p>
                    <p>
                        <strong>First Name:</strong>{' '}
                        {updatedUser?.first_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Last Name:</strong>{' '}
                        {updatedUser?.last_name || 'N/A'}
                    </p>
                    <p>
                        <strong>Height:</strong> {updatedUser?.height || 'N/A'}{' '}
                        cm
                    </p>
                    <p>
                        <strong>Date of Birth:</strong>{' '}
                        {updatedUser?.dob || 'N/A'}
                    </p>
                    <p>
                        <strong>Last Login:</strong>{' '}
                        {formatDateTime(updatedUser?.last_login)}
                    </p>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger className="mt-4 bg-yellow-400 text-black px-4 py-2 rounded hover:bg-yellow-300 transition">
                            Edit Profile
                        </DialogTrigger>
                        <DialogContent>
                            <UserDetailsEditForm
                                user={updatedUser}
                                accessToken={accessToken}
                                onClose={() => setIsModalOpen(false)}
                                onUpdate={handleUserUpdate} // ✅ Ensures UI & AuthContext update
                            />
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    )
}

export default UserDetailsCard