import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck, FiAlertCircle, FiKey } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './Login.css'

const Login = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { login, isAuthenticated, user, logout } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Where to redirect after login (default home)
    const fromPath = location.state?.from?.pathname || '/'

    // Fill demo credentials
    const handleFillDemo = () => {
        setEmail('reader@bookverse.com')
        setPassword('Password@123')
        setErrorMessage('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        if (!email.trim() || !password) {
            setErrorMessage('Please fill in both email and password.')
            return
        }

        setIsLoading(true)
        const result = await login(email, password)
        setIsLoading(false)

        if (result.success) {
            setSuccessMessage(`Welcome back, ${result.user.name}! Redirecting...`)
            setTimeout(() => {
                navigate(fromPath, { replace: true })
            }, 1200)
        } else {
            setErrorMessage(result.error || 'Authentication failed. Please try again.')
        }
    }

    // If already authenticated, show status card
    if (isAuthenticated && user && !successMessage) {
        return (
            <div className="auth-page-container">
                <motion.div
                    className="auth-card auth-card-logged-in"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="logged-in-badge">
                        <FiCheck /> Logged In
                    </div>
                    <div className="logged-in-avatar">
                        <img src={user.avatar} alt={user.name} />
                    </div>
                    <h2>{user.name}</h2>
                    <p className="logged-in-email">{user.email}</p>
                    <div className="jwt-session-box">
                        <span className="jwt-label"><FiKey /> Active JWT Session</span>
                        <code>{localStorage.getItem('bookverse_jwt_token')?.slice(0, 36)}...</code>
                    </div>

                    <div className="logged-in-actions">
                        <Link to="/" className="auth-primary-btn">
                            Return to Store
                        </Link>
                        <button type="button" className="auth-secondary-btn" onClick={logout}>
                            Sign Out
                        </button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="auth-page-container">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Left Side: Brand Imagery & Atmosphere */}
                <div className="auth-visual-column">
                    <div className="auth-visual-content">
                        <div className="auth-logo-badge">
                            <span className="logo-letter">B</span>
                            <span className="logo-brand">BOOKVERSE</span>
                        </div>
                        <blockquote className="auth-quote">
                            “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
                        </blockquote>
                        <cite className="auth-quote-author">— George R.R. Martin</cite>

                        <div className="auth-visual-perks">
                            <div className="perk-item">
                                <span className="perk-bullet">✦</span>
                                <span>Curated recommendations matched to your taste</span>
                            </div>
                            <div className="perk-item">
                                <span className="perk-bullet">✦</span>
                                <span>Sync your cart & wishlist across all devices</span>
                            </div>
                            <div className="perk-item">
                                <span className="perk-bullet">✦</span>
                                <span>Secure encrypted JWT authentication</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="auth-form-column">
                    <div className="auth-form-header">
                        <span className="auth-eyebrow">Welcome Back</span>
                        <h1 className="auth-title">Sign In to BookVerse</h1>
                        <p className="auth-subtitle">
                            Enter your credentials to access your library and orders.
                        </p>
                    </div>

                    {/* Quick Demo Credentials Pill */}
                    <div className="demo-credentials-pill">
                        <div className="demo-info">
                            <span className="demo-title">Quick Demo Reader Account:</span>
                            <span className="demo-user">reader@bookverse.com / Password@123</span>
                        </div>
                        <button
                            type="button"
                            className="demo-autofill-btn"
                            onClick={handleFillDemo}
                        >
                            Auto-Fill
                        </button>
                    </div>

                    {/* Alerts */}
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.div
                                className="auth-alert error-alert"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <FiAlertCircle className="alert-icon" />
                                <span>{errorMessage}</span>
                            </motion.div>
                        )}
                        {successMessage && (
                            <motion.div
                                className="auth-alert success-alert"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <FiCheck className="alert-icon" />
                                <span>{successMessage}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Login Form */}
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="login-email">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    id="login-email"
                                    type="email"
                                    placeholder="yourname@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="password-header-row">
                                <label htmlFor="login-password">Password</label>
                                <button
                                    type="button"
                                    className="forgot-link"
                                    onClick={() => alert('For testing, please use password: Password@123')}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Keep me logged in on this browser</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-spinner-content">
                                    <span className="spinner-dot" /> Authenticating JWT...
                                </span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <FiArrowRight className="submit-arrow" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer-prompt">
                        <span>New to BookVerse?</span>
                        <Link to="/signup" className="auth-switch-link">
                            Create a free account
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Login
