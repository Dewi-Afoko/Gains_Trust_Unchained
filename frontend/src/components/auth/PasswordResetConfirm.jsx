import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { confirmPasswordReset } from '../../api/usersApi'
import './PasswordReset.css'

const PasswordResetConfirm = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [passwordErrors, setPasswordErrors] = useState([])

    useEffect(() => {
        if (!token) {
            setError('Invalid reset link')
        }
    }, [token])

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        setError('')
        setPasswordErrors([])
    }

    const validatePassword = (password) => {
        const errors = []
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long')
        }
        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter')
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter')
        }
        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number')
        }
        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setPasswordErrors([])

        // Validate password
        const validationErrors = validatePassword(formData.newPassword)
        if (validationErrors.length > 0) {
            setPasswordErrors(validationErrors)
            setLoading(false)
            return
        }

        // Check if passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            await confirmPasswordReset(
                token,
                formData.newPassword,
                formData.confirmPassword
            )
            setSuccess(true)
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    err.response?.data?.new_password?.[0] ||
                    'Failed to reset password'
            )
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="reset-success">
                <div className="reset-container">
                    <h2>Password Reset Successful!</h2>
                    <p>Your password has been reset successfully.</p>
                    <p>
                        You will be redirected to the login page in a few
                        seconds...
                    </p>
                    <div className="reset-links">
                        <Link to="/login">Go to Login</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="reset-confirm">
            <div className="reset-container">
                <h2>Set New Password</h2>
                <p>Please enter your new password below.</p>

                <form onSubmit={handleSubmit} className="reset-form">
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            placeholder="Enter new password"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm new password"
                            disabled={loading}
                        />
                    </div>

                    {passwordErrors.length > 0 && (
                        <div className="error-message">
                            <ul>
                                {passwordErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !formData.newPassword ||
                            !formData.confirmPassword
                        }
                        className="reset-btn"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>

                <div className="reset-links">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    )
}

export default PasswordResetConfirm
