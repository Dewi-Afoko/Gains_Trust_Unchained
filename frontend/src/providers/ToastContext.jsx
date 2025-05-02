import { createContext, useContext } from 'react'
import toast from 'react-hot-toast'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
    // You can expand this to handle custom logic, queueing, etc.
    const showToast = (message, type = 'success', options = {}) => {
        if (type === 'success') toast.success(message, options)
        else if (type === 'error') toast.error(message, options)
        else toast(message, options)
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
        </ToastContext.Provider>
    )
}

export const useToastContext = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToastContext must be used within a ToastProvider')
    }
    return context
}
