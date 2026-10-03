import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { generateJWT, verifyAndDecodeJWT } from '../utils/jwt'

const AuthContext = createContext()

// Default pre-seeded users
const DEFAULT_USERS = [
    {
        id: 'usr-1',
        name: 'Aarav Mehta',
        email: 'reader@bookverse.com',
        password: 'Password@123',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        joinedDate: 'January 2026',
        favoriteGenre: 'Literary Fiction',
    },
]

export const AuthProvider = ({ children }) => {
    // Initialize token and user from localStorage
    const [token, setToken] = useState(() => {
        try {
            return localStorage.getItem('bookverse_jwt_token') || null
        } catch {
            return null
        }
    })

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('bookverse_current_user')
            const savedToken = localStorage.getItem('bookverse_jwt_token')
            if (savedUser && savedToken) {
                const verified = verifyAndDecodeJWT(savedToken)
                if (verified) {
                    return JSON.parse(savedUser)
                } else {
                    // Token expired or invalid, clear localStorage
                    localStorage.removeItem('bookverse_jwt_token')
                    localStorage.removeItem('bookverse_current_user')
                    return null
                }
            }
            return null
        } catch {
            return null
        }
    })

    // Retrieve or initialize registered users list in localStorage
    const getRegisteredUsers = () => {
        try {
            const stored = localStorage.getItem('bookverse_registered_users')
            if (stored) {
                return JSON.parse(stored)
            }
            localStorage.setItem('bookverse_registered_users', JSON.stringify(DEFAULT_USERS))
            return DEFAULT_USERS
        } catch {
            return DEFAULT_USERS
        }
    }

    // Login function
    const login = useCallback(async (email, password) => {
        // Simulate asynchronous network roundtrip
        await new Promise(resolve => setTimeout(resolve, 600))

        const users = getRegisteredUsers()
        const normalizedEmail = email.trim().toLowerCase()
        const found = users.find(u => u.email.toLowerCase() === normalizedEmail)

        if (!found) {
            return {
                success: false,
                error: 'No account found with this email address.',
            }
        }

        if (found.password !== password) {
            return {
                success: false,
                error: 'Incorrect password. Please verify and try again.',
            }
        }

        // Generate JWT Token (valid for 7 days)
        const iat = Math.floor(Date.now() / 1000)
        const exp = iat + 7 * 24 * 60 * 60 // 7 days
        const jwtPayload = {
            sub: found.id,
            name: found.name,
            email: found.email,
            role: 'reader',
            iat,
            exp,
        }

        const jwtToken = generateJWT(jwtPayload)

        const safeUser = {
            id: found.id,
            name: found.name,
            email: found.email,
            avatar: found.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(found.name)}&background=183b36&color=ffffff`,
            joinedDate: found.joinedDate || 'Recently joined',
            favoriteGenre: found.favoriteGenre || 'General',
        }

        // Persist to localStorage
        try {
            localStorage.setItem('bookverse_jwt_token', jwtToken)
            localStorage.setItem('bookverse_current_user', JSON.stringify(safeUser))
        } catch (err) {
            console.error('LocalStorage write failed:', err)
        }

        setToken(jwtToken)
        setUser(safeUser)

        return { success: true, user: safeUser, token: jwtToken }
    }, [])

    // Signup function
    const signup = useCallback(async ({ name, email, password }) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 700))

        const users = getRegisteredUsers()
        const normalizedEmail = email.trim().toLowerCase()

        if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
            return {
                success: false,
                error: 'An account with this email address already exists. Please log in.',
            }
        }

        const newUser = {
            id: `usr-${Date.now()}`,
            name: name.trim(),
            email: normalizedEmail,
            password,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=183b36&color=ffffff`,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            favoriteGenre: 'General Literature',
        }

        const updatedUsers = [...users, newUser]
        try {
            localStorage.setItem('bookverse_registered_users', JSON.stringify(updatedUsers))
        } catch (err) {
            console.error('Failed to save new user to localStorage:', err)
        }

        // Generate JWT Token
        const iat = Math.floor(Date.now() / 1000)
        const exp = iat + 7 * 24 * 60 * 60
        const jwtPayload = {
            sub: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: 'reader',
            iat,
            exp,
        }

        const jwtToken = generateJWT(jwtPayload)

        const safeUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            joinedDate: newUser.joinedDate,
            favoriteGenre: newUser.favoriteGenre,
        }

        // Save session to localStorage
        try {
            localStorage.setItem('bookverse_jwt_token', jwtToken)
            localStorage.setItem('bookverse_current_user', JSON.stringify(safeUser))
        } catch (err) {
            console.error('LocalStorage write failed:', err)
        }

        setToken(jwtToken)
        setUser(safeUser)

        return { success: true, user: safeUser, token: jwtToken }
    }, [])

    // Logout function
    const logout = useCallback(() => {
        try {
            localStorage.removeItem('bookverse_jwt_token')
            localStorage.removeItem('bookverse_current_user')
        } catch (err) {
            console.error('LocalStorage clear failed:', err)
        }
        setToken(null)
        setUser(null)
    }, [])

    const value = useMemo(() => ({
        user,
        token,
        isAuthenticated: Boolean(user && token),
        login,
        signup,
        logout,
    }), [user, token, login, signup, logout])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
