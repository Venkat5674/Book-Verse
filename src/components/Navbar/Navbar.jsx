import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { FiChevronDown, FiSun, FiMoon } from 'react-icons/fi'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import MegaMenu from '../MegaMenu/MegaMenu'
import SearchOverlay from '../SearchOverlay/SearchOverlay'
import './Navbar.css'

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const navbarRef = useRef(null)
    const { totalItems } = useCart()
    const { favoritesCount } = useFavorites()
    const { user, isAuthenticated, logout } = useAuth()
    const { theme, isDark, toggleTheme } = useTheme()

    // Handle scroll state for navbar styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Close menus on screen resize
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false)
            } else {
                setIsMegaMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMobileMenuOpen])

    // Close all menus on browser back/forward navigation
    useEffect(() => {
        const handlePopState = () => {
            setIsMobileMenuOpen(false)
            setIsMegaMenuOpen(false)
            setIsSearchOpen(false)
        }
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    // Click outside and Escape key handler for MegaMenu and Mobile Drawer
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMegaMenuOpen && navbarRef.current && !navbarRef.current.contains(event.target)) {
                setIsMegaMenuOpen(false)
            }
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setIsMegaMenuOpen(false)
                setIsMobileMenuOpen(false)
                setIsSearchOpen(false)
            }
        }

        document.addEventListener('pointerdown', handleClickOutside)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isMegaMenuOpen, isMobileMenuOpen])

    const closeMenu = () => {
        setIsMobileMenuOpen(false)
        setIsMegaMenuOpen(false)
        setIsSearchOpen(false)
    }

    return (
        <header ref={navbarRef} className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">

                {/* Logo */}
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <span className="logo-mark">B</span>

                    <span className="logo-text">
                        BOOK<span>VERSE</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="navbar-links" aria-label="Main Navigation">
                    <Link to="/" className="navbar-link" onClick={closeMenu}>
                        Home
                    </Link>

                    <Link to="/books" className="navbar-link" onClick={closeMenu}>
                        Books
                    </Link>

                    <button
                        type="button"
                        className="navbar-category"
                        onClick={() => setIsMegaMenuOpen((prev) => !prev)}
                        aria-expanded={isMegaMenuOpen}
                        aria-haspopup="true"
                    >
                        Categories
                        <span className={isMegaMenuOpen ? 'arrow-up' : ''}>
                            <FiChevronDown size={14} />
                        </span>
                    </button>

                    <Link to="/books?sort=bestseller" className="navbar-link" onClick={closeMenu}>
                        Best Sellers
                    </Link>

                    <Link to="/books?sort=newest" className="navbar-link" onClick={closeMenu}>
                        New Arrivals
                    </Link>
                </nav>

                {/* Actions */}
                <div className="navbar-actions">

                    <button
                        type="button"
                        className="navbar-action theme-toggle-btn"
                        aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                        title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                        onClick={(e) => toggleTheme(e)}
                    >
                        {isDark ? <FiSun className="theme-toggle-icon sun-icon" /> : <FiMoon className="theme-toggle-icon moon-icon" />}
                    </button>

                    <button
                        type="button"
                        className="navbar-action"
                        aria-label="Search"
                        onClick={() => {
                            setIsSearchOpen(true)
                            setIsMegaMenuOpen(false)
                            setIsMobileMenuOpen(false)
                        }}
                    >
                        <span>⌕</span>
                    </button>

                    <Link
                        to="/favorites"
                        className="navbar-action wishlist-action"
                        aria-label={`Favorite books (${favoritesCount} saved)`}
                        title="Favorite books"
                        onClick={closeMenu}
                    >
                        <span className="wishlist-nav-icon">{favoritesCount > 0 ? '♥' : '♡'}</span>
                        {favoritesCount > 0 && (
                            <span className="cart-count wishlist-count">{favoritesCount}</span>
                        )}
                    </Link>

                    <Link
                        to="/cart"
                        className="navbar-action cart-action"
                        aria-label="Shopping cart"
                        onClick={closeMenu}
                    >
                        <span>🛒</span>
                        <span className="cart-count">{totalItems}</span>
                    </Link>

                    {isAuthenticated && user ? (
                        <div className="navbar-user-pill">
                            <Link to="/login" className="user-profile-link" onClick={closeMenu} title="View Profile">
                                <img src={user.avatar} alt={user.name} className="navbar-avatar-img" />
                                <span className="navbar-user-name">{user.name.split(' ')[0]}</span>
                            </Link>
                            <button
                                type="button"
                                className="navbar-logout-btn"
                                onClick={() => {
                                    logout()
                                    closeMenu()
                                }}
                                title="Sign Out"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-button" onClick={closeMenu}>
                            Login
                        </Link>
                    )}

                    {/* Hamburger Button for screens < 1024px */}
                    <button
                        type="button"
                        className={`navbar-hamburger ${isMobileMenuOpen ? 'is-active' : ''}`}
                        onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                        aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>

                </div>

            </div>

            {/* Desktop Mega Menu Dropdown */}
            <MegaMenu isOpen={isMegaMenuOpen} onClose={() => setIsMegaMenuOpen(false)} />

            {/* Search Overlay */}
            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            {/* Backdrop Overlay and Mobile Drawer - Only rendered when hamburger menu is opened on < 1024px screens */}
            {isMobileMenuOpen &&
                createPortal(
                    <>
                        <div
                            className="navbar-overlay"
                            onClick={closeMenu}
                            aria-hidden="true"
                        />

                        <aside
                            className="navbar-mobile-drawer"
                            aria-label="Mobile Navigation"
                        >
                            <div className="mobile-drawer-header">
                                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                                    <span className="logo-mark">B</span>
                                    <span className="logo-text">
                                        BOOK<span>VERSE</span>
                                    </span>
                                </Link>

                                <button
                                    type="button"
                                    className="drawer-close-button"
                                    onClick={closeMenu}
                                    aria-label="Close menu"
                                >
                                    ✕
                                </button>
                            </div>

                            {isAuthenticated && user ? (
                                <div className="mobile-user-greeting">
                                    <img src={user.avatar} alt={user.name} className="mobile-greeting-avatar" />
                                    <div className="greeting-text">
                                        <span className="greeting-title">Hi, {user.name}</span>
                                        <span className="greeting-sub">{user.email}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mobile-user-greeting">
                                    <div className="greeting-text">
                                        <span className="greeting-title">Welcome to BookVerse</span>
                                        <span className="greeting-sub">Sign in to track orders</span>
                                    </div>
                                    <Link to="/login" className="greeting-login-link" onClick={closeMenu}>
                                        Login
                                    </Link>
                                </div>
                            )}

                            <nav className="mobile-drawer-links">
                                <Link to="/" className="mobile-nav-link" onClick={closeMenu}>
                                    <span>Home</span>
                                    <span className="mobile-arrow">→</span>
                                </Link>

                                <Link to="/books" className="mobile-nav-link" onClick={closeMenu}>
                                    <span>Books</span>
                                    <span className="mobile-arrow">→</span>
                                </Link>

                                <div className="mobile-nav-group">
                                    <span className="mobile-nav-category-title">Categories</span>
                                    <div className="mobile-category-chips">
                                        <Link to="/books?category=fiction" className="category-chip" onClick={closeMenu}>
                                            Fiction
                                        </Link>
                                        <Link to="/books?category=non-fiction" className="category-chip" onClick={closeMenu}>
                                            Non-Fiction
                                        </Link>
                                        <Link to="/books?category=sci-fi" className="category-chip" onClick={closeMenu}>
                                            Sci-Fi
                                        </Link>
                                        <Link to="/books?category=philosophy" className="category-chip" onClick={closeMenu}>
                                            Philosophy
                                        </Link>
                                        <Link to="/books?category=biography" className="category-chip" onClick={closeMenu}>
                                            Biography
                                        </Link>
                                    </div>
                                </div>

                                <Link to="/books?sort=bestseller" className="mobile-nav-link" onClick={closeMenu}>
                                    <span>Best Sellers</span>
                                    <span className="mobile-arrow">→</span>
                                </Link>

                                <Link to="/books?sort=newest" className="mobile-nav-link" onClick={closeMenu}>
                                    <span>New Arrivals</span>
                                    <span className="mobile-arrow">→</span>
                                </Link>

                                <Link to="/favorites" className="mobile-nav-link" onClick={closeMenu}>
                                    <span>Favorite Books {favoritesCount > 0 ? `(${favoritesCount})` : ''}</span>
                                    <span className="mobile-arrow">{favoritesCount > 0 ? '♥' : '♡'}</span>
                                </Link>
                            </nav>

                            <div className="mobile-drawer-footer">
                                <button
                                    type="button"
                                    className="mobile-theme-toggle-btn"
                                    onClick={(e) => toggleTheme(e)}
                                >
                                    <span>Appearance: {isDark ? 'Dark Mode' : 'Light Mode'}</span>
                                    {isDark ? <FiSun /> : <FiMoon />}
                                </button>
                                {isAuthenticated ? (
                                    <button
                                        type="button"
                                        className="mobile-login-button mobile-logout-btn"
                                        onClick={() => {
                                            logout()
                                            closeMenu()
                                        }}
                                    >
                                        <span>Sign Out</span>
                                    </button>
                                ) : (
                                    <Link to="/login" className="mobile-login-button" onClick={closeMenu}>
                                        <span>Log In / Sign Up</span>
                                    </Link>
                                )}
                            </div>
                        </aside>
                    </>,
                    document.body
                )}
        </header>
    )
}

export default Navbar