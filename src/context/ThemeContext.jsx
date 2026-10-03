import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('bookverse_theme')
            if (saved) return saved
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
        } catch {
            return 'light'
        }
    })

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
        try {
            localStorage.setItem('bookverse_theme', theme)
        } catch {}
    }, [theme])

    const toggleTheme = useCallback((event) => {
        const nextTheme = theme === 'dark' ? 'light' : 'dark'

        // Determine click origin coordinates from the triggering button
        let x = window.innerWidth / 2
        let y = 50

        if (event) {
            if (event.clientX !== undefined && event.clientY !== undefined && (event.clientX !== 0 || event.clientY !== 0)) {
                x = event.clientX
                y = event.clientY
            } else if (event.currentTarget) {
                const rect = event.currentTarget.getBoundingClientRect()
                x = rect.left + rect.width / 2
                y = rect.top + rect.height / 2
            }
        } else {
            const btn = document.querySelector('.theme-toggle-btn')
            if (btn) {
                const rect = btn.getBoundingClientRect()
                x = rect.left + rect.width / 2
                y = rect.top + rect.height / 2
            }
        }

        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        )

        // 1. If View Transitions API is natively available in the browser (Chrome, Edge, modern browsers)
        if (typeof document.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            const transition = document.startViewTransition(() => {
                flushSync(() => {
                    setTheme(nextTheme)
                    document.documentElement.setAttribute('data-theme', nextTheme)
                    try {
                        localStorage.setItem('bookverse_theme', nextTheme)
                    } catch {}
                })
            })

            transition.ready.then(() => {
                const clipPath = [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`,
                ]

                // The incoming new view (::view-transition-new(root)) is always on top (z-index 9999999).
                // Expanding it circularly from (x, y) creates the beautiful slow ripple in BOTH directions!
                document.documentElement.animate(
                    {
                        clipPath: clipPath,
                    },
                    {
                        duration: 950,
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    }
                )
            }).catch(() => {
                setTheme(nextTheme)
            })
        } else {
            // 2. Beautiful circular ripple fallback for environments without View Transitions
            const ripple = document.createElement('div')
            ripple.className = 'theme-circle-ripple'
            ripple.style.left = `${x}px`
            ripple.style.top = `${y}px`
            ripple.style.width = `${endRadius * 2}px`
            ripple.style.height = `${endRadius * 2}px`
            ripple.style.marginLeft = `-${endRadius}px`
            ripple.style.marginTop = `-${endRadius}px`
            ripple.style.backgroundColor = nextTheme === 'dark' ? '#0f1117' : '#f7f4ee'
            document.body.appendChild(ripple)

            requestAnimationFrame(() => {
                ripple.classList.add('is-active')
            })

            setTimeout(() => {
                setTheme(nextTheme)
                document.documentElement.setAttribute('data-theme', nextTheme)
                try {
                    localStorage.setItem('bookverse_theme', nextTheme)
                } catch {}

                setTimeout(() => {
                    ripple.style.opacity = '0'
                    setTimeout(() => {
                        ripple.remove()
                    }, 500)
                }, 400)
            }, 600)
        }
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
