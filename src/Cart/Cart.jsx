import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
    FiShoppingBag,
    FiTrash2,
    FiPlus,
    FiMinus,
    FiArrowRight,
    FiArrowLeft,
    FiTag,
    FiGift,
    FiShield,
    FiTruck,
    FiCheck,
    FiAlertCircle,
} from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import './Cart.css'

const AVAILABLE_COUPONS = {
    BOOKVERSE10: { code: 'BOOKVERSE10', discountType: 'percent', value: 10, label: '10% Off Entire Order' },
    READMORE: { code: 'READMORE', discountType: 'fixed', value: 150, label: '₹150 Off on orders above ₹799', minOrder: 799 },
    FREESHIP: { code: 'FREESHIP', discountType: 'shipping', value: 0, label: 'Free Delivery on any order' },
}

const Cart = () => {
    const navigate = useNavigate()
    const {
        cartItems,
        totalItems,
        totalAmount,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    } = useCart()

    const [couponInput, setCouponInput] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponError, setCouponError] = useState('')
    const [couponSuccess, setCouponSuccess] = useState('')
    const [includeGiftWrap, setIncludeGiftWrap] = useState(false)

    // Free delivery threshold: ₹499
    const freeDeliveryThreshold = 499
    const freeDeliveryProgress = Math.min(100, Math.round((totalAmount / freeDeliveryThreshold) * 100))
    const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - totalAmount)

    // Calculate Discounts & Totals
    const discountAmount = useMemo(() => {
        if (!appliedCoupon) return 0
        if (appliedCoupon.discountType === 'percent') {
            return Math.round((totalAmount * appliedCoupon.value) / 100)
        }
        if (appliedCoupon.discountType === 'fixed') {
            return Math.min(totalAmount, appliedCoupon.value)
        }
        return 0
    }, [appliedCoupon, totalAmount])

    const shippingFee = useMemo(() => {
        if (appliedCoupon?.discountType === 'shipping') return 0
        if (totalAmount >= freeDeliveryThreshold || totalAmount === 0) return 0
        return 50
    }, [appliedCoupon, totalAmount])

    const giftWrapFee = includeGiftWrap ? 49 : 0
    const finalTotal = Math.max(0, totalAmount - discountAmount + shippingFee + giftWrapFee)

    // Handle Promo Code submission
    const handleApplyCoupon = (e) => {
        if (e) e.preventDefault()
        setCouponError('')
        setCouponSuccess('')

        const cleanCode = couponInput.trim().toUpperCase()
        if (!cleanCode) {
            setCouponError('Please enter a coupon code.')
            return
        }

        const coupon = AVAILABLE_COUPONS[cleanCode]
        if (!coupon) {
            setCouponError('Invalid code. Try BOOKVERSE10 or READMORE.')
            return
        }

        if (coupon.minOrder && totalAmount < coupon.minOrder) {
            setCouponError(`This coupon requires a minimum subtotal of ₹${coupon.minOrder}.`)
            return
        }

        setAppliedCoupon(coupon)
        setCouponSuccess(`Coupon "${coupon.code}" applied: ${coupon.label}!`)
        setCouponInput('')
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setCouponSuccess('')
        setCouponError('')
    }

    const handleQuickApply = (code) => {
        setCouponInput(code)
        const coupon = AVAILABLE_COUPONS[code]
        if (coupon.minOrder && totalAmount < coupon.minOrder) {
            setCouponError(`This coupon requires a minimum subtotal of ₹${coupon.minOrder}.`)
            return
        }
        setAppliedCoupon(coupon)
        setCouponSuccess(`Coupon "${code}" applied: ${coupon.label}!`)
        setCouponError('')
    }

    // Proceed to checkout with summary passed in state
    const handleProceedToCheckout = () => {
        navigate('/checkout', {
            state: {
                appliedCoupon,
                discountAmount,
                shippingFee,
                giftWrapFee,
                includeGiftWrap,
                finalTotal,
            },
        })
    }

    // Empty Cart View
    if (cartItems.length === 0) {
        return (
            <div className="cart-page-container">
                <div className="empty-cart-card">
                    <div className="empty-cart-icon-wrapper">
                        <FiShoppingBag className="empty-bag-icon" />
                    </div>
                    <h2 className="empty-cart-title">Your Reading Basket is Empty</h2>
                    <p className="empty-cart-subtitle">
                        Your library awaits great stories. Discover trending bestsellers, timeless classics, and handpicked literary treasures.
                    </p>
                    <div className="empty-cart-actions">
                        <Link to="/books" className="browse-books-btn">
                            Explore Books Catalog <FiArrowRight />
                        </Link>
                        <Link to="/" className="back-home-link">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-page-container">
            <div className="cart-content-wrapper">
                {/* Breadcrumbs */}
                <nav className="cart-breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="crumb-sep">/</span>
                    <Link to="/books">Books</Link>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-active">Shopping Basket</span>
                </nav>

                {/* Free Delivery Incentive Header */}
                <div className="delivery-progress-banner">
                    <div className="delivery-banner-text">
                        <FiTruck className="truck-icon" />
                        {amountNeededForFreeDelivery > 0 ? (
                            <span>
                                Add <strong>₹{amountNeededForFreeDelivery}</strong> more to enjoy <strong>FREE Express Delivery</strong>!
                            </span>
                        ) : (
                            <span className="unlocked-text">
                                🎉 Congratulations! You've unlocked <strong>FREE Express Delivery</strong> on this order!
                            </span>
                        )}
                    </div>
                    <div className="progress-bar-track">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${freeDeliveryProgress}%` }}
                        />
                    </div>
                </div>

                {/* Main 2-Column Cart Layout */}
                <div className="cart-main-grid">
                    {/* Left: Cart Items List */}
                    <div className="cart-items-section">
                        <div className="cart-section-header">
                            <div>
                                <h1 className="cart-heading">Shopping Basket</h1>
                                <span className="cart-item-count-label">
                                    {totalItems} {totalItems === 1 ? 'item' : 'items'} in your basket
                                </span>
                            </div>
                            <button
                                type="button"
                                className="clear-cart-link"
                                onClick={clearCart}
                            >
                                Clear Basket
                            </button>
                        </div>

                        {/* List of items */}
                        <div className="cart-items-list">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.article
                                        key={item.id}
                                        className="cart-item-card"
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link
                                            to={`/books/${item.id}`}
                                            state={{ book: item }}
                                            onClick={() => {
                                                try {
                                                    sessionStorage.setItem(`bookverse_book_${item.id}`, JSON.stringify(item))
                                                } catch {}
                                            }}
                                            className="cart-item-image-box"
                                        >
                                            <img src={item.image} alt={item.title} />
                                        </Link>

                                        <div className="cart-item-details">
                                            <div className="cart-item-top">
                                                <div>
                                                    <Link
                                                        to={`/books/${item.id}`}
                                                        state={{ book: item }}
                                                        onClick={() => {
                                                            try {
                                                                sessionStorage.setItem(`bookverse_book_${item.id}`, JSON.stringify(item))
                                                            } catch {}
                                                        }}
                                                        className="cart-item-title"
                                                    >
                                                        {item.title}
                                                    </Link>
                                                    <p className="cart-item-author">by {item.author}</p>
                                                    {item.format && (
                                                        <span className="cart-item-format-tag">
                                                            {item.format}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    className="cart-remove-btn"
                                                    onClick={() => removeFromCart(item.id)}
                                                    aria-label={`Remove ${item.title} from basket`}
                                                    title="Remove item"
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>

                                            <div className="cart-item-bottom">
                                                <div className="cart-qty-control">
                                                    <button
                                                        type="button"
                                                        className="cart-qty-btn"
                                                        onClick={() => decreaseQuantity(item.id)}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <FiMinus />
                                                    </button>
                                                    <span className="cart-qty-value">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        className="cart-qty-btn"
                                                        onClick={() => increaseQuantity(item.id)}
                                                        aria-label="Increase quantity"
                                                    >
                                                        <FiPlus />
                                                    </button>
                                                </div>

                                                <div className="cart-item-price-col">
                                                    <span className="cart-item-total-price">
                                                        ₹{item.price * item.quantity}
                                                    </span>
                                                    {item.quantity > 1 && (
                                                        <span className="cart-item-unit-price">
                                                            (₹{item.price} each)
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Gift Wrap & Note Option */}
                        <div className="cart-gift-wrap-card">
                            <label className="gift-wrap-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={includeGiftWrap}
                                    onChange={(e) => setIncludeGiftWrap(e.target.checked)}
                                />
                                <div className="gift-wrap-info">
                                    <span className="gift-wrap-title">
                                        <FiGift className="gift-icon" /> Luxury Gift Packaging (+₹49)
                                    </span>
                                    <span className="gift-wrap-desc">
                                        Packed in premium BookVerse wrapping paper with an embossed bookmark and personalized handwritten card.
                                    </span>
                                </div>
                            </label>
                        </div>

                        {/* Coupon / Promo Code Box */}
                        <div className="cart-coupon-box">
                            <div className="coupon-header">
                                <FiTag className="tag-icon" />
                                <h3>Have a Promotional Voucher?</h3>
                            </div>

                            {appliedCoupon ? (
                                <div className="applied-coupon-pill">
                                    <div className="coupon-pill-left">
                                        <FiCheck className="check-icon" />
                                        <div>
                                            <strong>{appliedCoupon.code}</strong>
                                            <span>{appliedCoupon.label}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-coupon-btn"
                                        onClick={handleRemoveCoupon}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <form className="coupon-form" onSubmit={handleApplyCoupon}>
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code (e.g. BOOKVERSE10)"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                        />
                                        <button type="submit" className="apply-coupon-btn">
                                            Apply
                                        </button>
                                    </form>

                                    <div className="available-coupons-chips">
                                        <span className="chips-label">Quick apply:</span>
                                        <button
                                            type="button"
                                            className="coupon-chip"
                                            onClick={() => handleQuickApply('BOOKVERSE10')}
                                        >
                                            BOOKVERSE10 <span>(10% off)</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="coupon-chip"
                                            onClick={() => handleQuickApply('READMORE')}
                                        >
                                            READMORE <span>(₹150 off)</span>
                                        </button>
                                    </div>
                                </>
                            )}

                            {couponError && (
                                <div className="coupon-msg error">
                                    <FiAlertCircle /> {couponError}
                                </div>
                            )}
                            {couponSuccess && (
                                <div className="coupon-msg success">
                                    <FiCheck /> {couponSuccess}
                                </div>
                            )}
                        </div>

                        {/* Continue Shopping Link */}
                        <div className="continue-shopping-row">
                            <Link to="/books" className="continue-shopping-link">
                                <FiArrowLeft /> Continue Browsing Books
                            </Link>
                        </div>
                    </div>

                    {/* Right: Order Summary Sidebar */}
                    <aside className="cart-summary-section">
                        <div className="order-summary-card">
                            <h2 className="summary-card-title">Order Summary</h2>

                            <div className="summary-breakdown-list">
                                <div className="summary-row">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span>₹{totalAmount}</span>
                                </div>

                                {appliedCoupon && (
                                    <div className="summary-row discount-row">
                                        <span>Coupon Discount ({appliedCoupon.code})</span>
                                        <span>-₹{discountAmount}</span>
                                    </div>
                                )}

                                {includeGiftWrap && (
                                    <div className="summary-row">
                                        <span>Luxury Gift Packaging</span>
                                        <span>₹{giftWrapFee}</span>
                                    </div>
                                )}

                                <div className="summary-row">
                                    <span>Estimated Delivery</span>
                                    <span className={shippingFee === 0 ? 'free-shipping-tag' : ''}>
                                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                                    </span>
                                </div>

                                <div className="summary-divider" />

                                <div className="summary-row total-row">
                                    <span>Total Payable</span>
                                    <span className="final-total-amount">₹{finalTotal}</span>
                                </div>

                                <span className="tax-note">
                                    Inclusive of GST and all applicable postal duties
                                </span>
                            </div>

                            <button
                                type="button"
                                className="proceed-checkout-btn"
                                onClick={handleProceedToCheckout}
                            >
                                <span>Proceed to Checkout</span>
                                <FiArrowRight className="checkout-arrow" />
                            </button>

                            {/* Trust Badges in sidebar */}
                            <div className="summary-trust-badges">
                                <div className="trust-badge-item">
                                    <FiShield className="trust-icon" />
                                    <span>256-Bit SSL Encrypted Checkout</span>
                                </div>
                                <div className="trust-badge-item">
                                    <FiCheck className="trust-icon" />
                                    <span>100% Genuine Certified Edition Guarantee</span>
                                </div>
                                <div className="trust-badge-item">
                                    <FiTruck className="trust-icon" />
                                    <span>Tracked Courier with Tamper-Proof Packaging</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Cart
