import { useState } from 'react'
import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog'
import useAuthStore from '../../stores/authStore'
import UserDetailsEditForm from './UserDetailsEditForm'
import { formatDateTime } from '../../utils/formatters'
import { deleteUser } from '../../api/usersApi'
import { useNavigate } from 'react-router-dom'
import PanelHeader from '../ui/PanelHeader'
import PanelButton from '../ui/PanelButton'
import texture2 from '../../assets/texture2.png'
import { User, Calendar, Clock, Ruler, Cake } from 'lucide-react'
import React from 'react'

const InfoRow = React.forwardRef(({ label, value, icon: Icon }, ref) => (
    <div
        ref={ref}
        className="relative flex items-center p-3 bg-black/30 rounded-lg border border-brand-gold/30 group hover:border-brand-gold/50 transition-all hover:bg-black/40 w-full"
    >
        <div className="bg-gradient-to-b from-yellow-400 via-yellow-600 to-orange-700 rounded-full p-1.5 mr-3 group-hover:scale-110 transition-transform">
            <Icon className="w-4 h-4 text-black stroke-[2.5px]" />
        </div>
        <div className="flex-1 text-center">
            <span className="text-brand-gold/70 text-sm font-semibold uppercase tracking-wider">{label}</span>
            <div className="text-white font-medium mt-0.5">{value || 'N/A'}</div>
        </div>
        {/* Corner Rivets with Hover Effect */}
        <div className="absolute left-1 top-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
        <div className="absolute right-1 top-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
        <div className="absolute left-1 bottom-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
        <div className="absolute right-1 bottom-1 w-1.5 h-1.5 bg-yellow-700 rounded-full shadow-inner opacity-70 group-hover:bg-brand-gold group-hover:opacity-100 transition-all" />
    </div>
))

InfoRow.displayName = 'InfoRow'

const UserDetailsCard = () => {
    const { user, logout } = useAuthStore()
    const [updatedUser, setUpdatedUser] = useState(user)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const navigate = useNavigate()

    const handleUserUpdate = (newUserData) => {
        setUpdatedUser(newUserData)
        setIsModalOpen(false)
    }

    const handleDeleteAccount = async () => {
        setIsDeleting(true)
        try {
            await deleteUser()
            logout()
            navigate('/login')
        } catch (error) {
            alert('Failed to delete account. Please try again.')
        } finally {
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
        }
    }

    return (
        <div className="flex flex-col h-full w-full">
            <PanelHeader title="User Details" icon={User} />
            <div className="flex-1 flex flex-col gap-3 px-0 pt-2 pb-0">
                <InfoRow 
                    label="Username"
                    value={user?.username}
                    icon={User}
                />
                <InfoRow 
                    label="Date Joined"
                    value={formatDateTime(user?.date_joined)}
                    icon={Calendar}
                />
                <InfoRow 
                    label="Last Login"
                    value={formatDateTime(user?.last_login)}
                    icon={Clock}
                />
                <InfoRow 
                    label="Height"
                    value={user?.height ? `${user.height} cm` : 'N/A'}
                    icon={Ruler}
                />
                <InfoRow 
                    label="Date of Birth"
                    value={user?.dob}
                    icon={Cake}
                />
            </div>

            <div className="mt-auto space-y-3 pt-3">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <PanelButton className="w-full hover:scale-[1.02] active:scale-[0.98] transition-transform">
                            Edit Profile
                        </PanelButton>
                    </DialogTrigger>
                    <DialogContent>
                        <UserDetailsEditForm
                            user={updatedUser}
                            onClose={() => setIsModalOpen(false)}
                            onUpdate={handleUserUpdate}
                        />
                    </DialogContent>
                </Dialog>
                <button 
                    onClick={() => setIsDeleteModalOpen(true)} 
                    className="text-sm text-brand-gold/60 hover:text-brand-gold hover:underline transition-colors inline-block relative group w-full text-center"
                >
                    Delete your Gains Trust account?
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold/60 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </button>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                    <div className="bg-brand-dark-2 p-8 rounded-xl border border-brand-gold max-w-md mx-4">
                        <h3 className="text-2xl font-bold text-brand-gold mb-4 text-center gains-font">
                            Confirm Account Deletion
                        </h3>
                        <p className="text-white mb-6 text-center">
                            Are you sure you want to delete your account? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <PanelButton
                                className="w-auto px-4 py-2"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </PanelButton>
                            <PanelButton
                                className="w-auto px-4 py-2 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 border-red-500/50"
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </PanelButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UserDetailsCard
