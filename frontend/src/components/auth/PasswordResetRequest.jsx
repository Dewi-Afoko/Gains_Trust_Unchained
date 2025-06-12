import React, { useState } from 'react'
import { requestPasswordReset } from '../../api/usersApi'
import { Link } from 'react-router-dom'
import './PasswordReset.css'

const PasswordResetRequest = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [emailSent, setEmailSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setMessage('')

        try {
            const response = await requestPasswordReset(email)
            setMessage(response.message)
            setEmailSent(true)
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.email?.[0] || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    if (emailSent) {
        return (
            <div className="reset-success">
                <div className="reset-container">
                    <h2>Email Sent!</h2>
                    <p>{message}</p>
                    <p>Please check your email and click the reset link to continue.</p>
                    <div className="reset-links">
                        <Link to="/login">Back to Login</Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="reset-request">
            <div className="reset-container">
                <h2>Reset Your Password</h2>
                <p>Enter your email address and we&apos;ll send you a link to reset your password.</p>
                
                <form onSubmit={handleSubmit} className="reset-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email address"
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}

                    <button 
                        type="submit" 
                        disabled={loading || !email}
                        className="reset-btn"
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="reset-links">
                    <Link to="/login">Back to Login</Link>
                    <span> | </span>
                    <Link to="/register">Don&apos;t have an account? Register</Link>
                </div>
            </div>
        </div>
    )
}

export default PasswordResetRequest 