import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
    FiUser,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
    FiArrowRight,
    FiCheck,
    FiAlertCircle,
    FiAward,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import '../Login/Login.css'
import './Signup.css'

const Signup = () => {
    const navigate = useNavigate()
    const { signup, isAuthenticated, user } = useAuth()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Password strength evaluation
    const passwordStrength = useMemo(() => {
        if (!password) return { level: 0, text: '', color: '' }
        let score = 0
        if (password.length >= 8) score += 1
        if (/[A-Z]/.test(password)) score += 1
        if (/[0-9]/.test(password)) score += 1
        if (/[^A-Za-z0-9]/.test(password)) score += 1

        if (score <= 1) return { level: 1, text: 'Weak', color: '#e53e3e' }
        if (score === 2 || score === 3) return { level: 2, text: 'Medium', color: '#dd6b20' }
        return { level: 3, text: 'Strong', color: '#38a169' }
    }, [password])

    // Quick fill sample user
    const handleFillSample = () => {
        const randId = Math.floor(100 + Math.random() * 900)
        setName(`Meera Sen`)
        setEmail(`meera${randId}@bookverse.com`)
        setPassword(`Reader@${randId}`)
        setConfirmPassword(`Reader@${randId}`)
        setErrorMessage('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        if (!name.trim()) {
            setErrorMessage('Please enter your full name.')
            return
        }

        if (!email.trim() || !email.includes('@')) {
            setErrorMessage('Please enter a valid email address.')
            return
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.')
            return
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match. Please verify.')
            return
        }

        if (!agreeTerms) {
            setErrorMessage('Please accept the Terms of Service to continue.')
            return
        }

        setIsLoading(true)
        const result = await signup({ name, email, password })
        setIsLoading(false)

        if (result.success) {
            setSuccessMessage(`Account created successfully! Welcome to BookVerse, ${result.user.name}.`)
            setTimeout(() => {
                navigate('/', { replace: true })
            }, 1400)
        } else {
            setErrorMessage(result.error || 'Failed to create account. Please try again.')
        }
    }

    if (isAuthenticated && user && !successMessage) {
        return (
            <div className="auth-page-container">
                <div className="auth-card auth-card-logged-in">
                    <div className="logged-in-badge">
                        <FiCheck /> You are already logged in
                    </div>
                    <h2>Welcome, {user.name}</h2>
                    <p className="logged-in-email">Active account: {user.email}</p>
                    <Link to="/" className="auth-primary-btn">
                        Go to Bookstore Catalog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-page-container">
            <motion.div
                className="auth-card signup-card-grid"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Left Visual Column */}
                <div className="auth-visual-column">
                    <div className="auth-visual-content">
                        <div className="auth-logo-badge">
                            <span className="logo-letter">B</span>
                            <span className="logo-brand">BOOKVERSE</span>
                        </div>

                        <div className="signup-badge-callout">
                            <FiAward className="signup-callout-icon" />
                            <span>Exclusive Reader Privileges</span>
                        </div>

                        <blockquote className="auth-quote">
                            “Books are a uniquely portable magic.”
                        </blockquote>
                        <cite className="auth-quote-author">— Stephen King</cite>

                        <div className="auth-visual-perks">
                            <div className="perk-item">
                                <span className="perk-bullet">✦</span>
                                <span>Get 10% welcome discount on your first order</span>
                            </div>
                            <div className="perk-item">
                                <span className="perk-bullet">✦</span>
                                <span>Save bookmarks, reviews, and reading lists</span>
                            </div>
                            <div className="perk-item">
                                <span className="perk-bullet">✦</span>
                                <span>Early access to seasonal collector's editions</span>
                            </div>
                            <div className="perk-item">
                                <span className="perk-bullet">✦</span>
                                <span>Signed JWT authentication token stored locally</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Column */}
                <div className="auth-form-column signup-form-column">
                    <div className="auth-form-header">
                        <span className="auth-eyebrow">Get Started</span>
                        <h1 className="auth-title">Create an Account</h1>
                        <p className="auth-subtitle">
                            Join over 50,000 bibliophiles and unlock personalized recommendations.
                        </p>
                    </div>

                    {/* Quick Sample Autofill */}
                    <div className="demo-credentials-pill">
                        <div className="demo-info">
                            <span className="demo-title">Fast Testing:</span>
                            <span className="demo-user">Generate random test user credentials</span>
                        </div>
                        <button
                            type="button"
                            className="demo-autofill-btn"
                            onClick={handleFillSample}
                        >
                            Quick Fill
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

                    {/* Form */}
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="signup-name">Full Name</label>
                            <div className="input-wrapper">
                                <FiUser className="input-icon" />
                                <input
                                    id="signup-name"
                                    type="text"
                                    placeholder="e.g. Meera Sen"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    autoComplete="name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-email">Email Address</label>
                            <div className="input-wrapper">
                                <FiMail className="input-icon" />
                                <input
                                    id="signup-email"
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
                            <label htmlFor="signup-password">Create Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    id="signup-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="new-password"
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

                            {/* Password strength meter */}
                            {password && (
                                <div className="password-meter-bar">
                                    <div className="meter-tracks">
                                        <div
                                            className={`meter-step ${passwordStrength.level >= 1 ? 'active' : ''}`}
                                            style={{ backgroundColor: passwordStrength.level >= 1 ? passwordStrength.color : '' }}
                                        />
                                        <div
                                            className={`meter-step ${passwordStrength.level >= 2 ? 'active' : ''}`}
                                            style={{ backgroundColor: passwordStrength.level >= 2 ? passwordStrength.color : '' }}
                                        />
                                        <div
                                            className={`meter-step ${passwordStrength.level >= 3 ? 'active' : ''}`}
                                            style={{ backgroundColor: passwordStrength.level >= 3 ? passwordStrength.color : '' }}
                                        />
                                    </div>
                                    <span className="meter-label" style={{ color: passwordStrength.color }}>
                                        {passwordStrength.text} Password
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-confirm-password">Confirm Password</label>
                            <div className="input-wrapper">
                                <FiLock className="input-icon" />
                                <input
                                    id="signup-confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-options-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <span>I agree to the Terms of Service & Privacy Policy</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="btn-spinner-content">
                                    <span className="spinner-dot" /> Generating JWT Token...
                                </span>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <FiArrowRight className="submit-arrow" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer-prompt">
                        <span>Already registered?</span>
                        <Link to="/login" className="auth-switch-link">
                            Sign in here
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default Signup
