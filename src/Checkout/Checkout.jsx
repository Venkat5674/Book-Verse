import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import {
    FiCheckCircle,
    FiTruck,
    FiShield,
    FiCreditCard,
    FiSmartphone,
    FiDollarSign,
    FiLock,
    FiArrowLeft,
    FiPackage,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiCheck,
} from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import './Checkout.css'

const Checkout = () => {
    const location = useLocation()
    const { cartItems, totalAmount, clearCart } = useCart()
    const { user, isAuthenticated } = useAuth()

    // Retrieve state passed from Cart or calculate fallbacks
    const cartState = location.state || {}
    const discountAmount = cartState.discountAmount || 0
    const appliedCoupon = cartState.appliedCoupon || null
    const giftWrapFee = cartState.giftWrapFee || 0

    // Form State
    const [fullName, setFullName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [stateName, setStateName] = useState('Delhi')
    const [pinCode, setPinCode] = useState('')

    // Delivery & Payment
    const [shippingSpeed, setShippingSpeed] = useState('standard') // 'standard' | 'express'
    const [paymentMethod, setPaymentMethod] = useState('upi') // 'upi' | 'card' | 'cod'

    // Payment details
    const [upiId, setUpiId] = useState('')
    const [cardNumber, setCardNumber] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [cardCvv, setCardCvv] = useState('')
    const [cardHolder, setCardHolder] = useState(user?.name || '')

    // Order Submission State
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [confirmedOrder, setConfirmedOrder] = useState(null)

    // Calculate Final Total
    const baseShipping = totalAmount >= 499 || appliedCoupon?.discountType === 'shipping' ? 0 : 50
    const expressShippingAddon = shippingSpeed === 'express' ? 99 : 0
    const finalShipping = baseShipping + expressShippingAddon
    const finalTotal = Math.max(0, totalAmount - discountAmount + finalShipping + giftWrapFee)

    // Form Submission
    const handlePlaceOrder = (e) => {
        e.preventDefault()
        setErrorMessage('')

        if (!fullName.trim()) {
            setErrorMessage('Please provide your full name for shipping.')
            return
        }

        if (!email.trim() || !email.includes('@')) {
            setErrorMessage('Please provide a valid email address for order confirmation.')
            return
        }

        if (!phone.trim() || phone.trim().length < 10) {
            setErrorMessage('Please provide a valid 10-digit mobile number.')
            return
        }

        if (!address.trim() || !city.trim() || !pinCode.trim()) {
            setErrorMessage('Please provide complete shipping address details.')
            return
        }

        if (paymentMethod === 'upi' && !upiId.trim()) {
            setErrorMessage('Please enter your UPI ID (e.g. mobile@upi).')
            return
        }

        if (paymentMethod === 'card' && (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
            setErrorMessage('Please provide complete card details.')
            return
        }

        setIsSubmitting(true)

        // Simulate secure order placement and payment gateway latency
        setTimeout(() => {
            const orderId = `BV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
            const deliveryDays = shippingSpeed === 'express' ? 2 : 4
            const estimatedDate = new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000)
                .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })

            const orderSummary = {
                orderId,
                estimatedDate,
                items: [...cartItems],
                totalAmount: finalTotal,
                paymentMethod: paymentMethod.toUpperCase(),
                shippingAddress: {
                    fullName,
                    email,
                    phone,
                    address,
                    city,
                    stateName,
                    pinCode,
                },
                placedAt: new Date().toLocaleString(),
            }

            setConfirmedOrder(orderSummary)
            clearCart()
            setIsSubmitting(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 1500)
    }

    // Success State View
    if (confirmedOrder) {
        return (
            <div className="checkout-page-container">
                <motion.div
                    className="order-confirmation-card"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="confirmation-badge-wrapper">
                        <FiCheckCircle className="confirmation-check-icon" />
                    </div>

                    <span className="order-confirmed-eyebrow">Payment Confirmed</span>
                    <h1 className="confirmation-title">Thank You for Your Order!</h1>
                    <p className="confirmation-subtitle">
                        Your literary journey has begun. We have received your order and our editorial team is preparing your books with utmost care.
                    </p>

                    <div className="order-reference-box">
                        <div className="ref-item">
                            <span className="ref-label">Order Reference</span>
                            <strong className="ref-val">{confirmedOrder.orderId}</strong>
                        </div>
                        <div className="ref-divider" />
                        <div className="ref-item">
                            <span className="ref-label">Estimated Delivery</span>
                            <strong className="ref-val highlight-green">{confirmedOrder.estimatedDate}</strong>
                        </div>
                        <div className="ref-divider" />
                        <div className="ref-item">
                            <span className="ref-label">Payment Method</span>
                            <strong className="ref-val">{confirmedOrder.paymentMethod}</strong>
                        </div>
                        <div className="ref-divider" />
                        <div className="ref-item">
                            <span className="ref-label">Total Paid</span>
                            <strong className="ref-val">₹{confirmedOrder.totalAmount}</strong>
                        </div>
                    </div>

                    <div className="confirmation-details-grid">
                        <div className="confirmation-info-col">
                            <h3><FiMapPin /> Delivery Address</h3>
                            <p><strong>{confirmedOrder.shippingAddress.fullName}</strong></p>
                            <p>{confirmedOrder.shippingAddress.address}</p>
                            <p>{confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.stateName} - {confirmedOrder.shippingAddress.pinCode}</p>
                            <p>Phone: {confirmedOrder.shippingAddress.phone}</p>
                            <p>Email: {confirmedOrder.shippingAddress.email}</p>
                        </div>

                        <div className="confirmation-info-col">
                            <h3><FiPackage /> Ordered Titles ({confirmedOrder.items.length})</h3>
                            <ul className="ordered-books-mini-list">
                                {confirmedOrder.items.map((b, i) => (
                                    <li key={i} className="ordered-book-mini-item">
                                        <img src={b.image} alt={b.title} />
                                        <div>
                                            <span className="mini-title">{b.title}</span>
                                            <span className="mini-meta">Qty: {b.quantity} • ₹{b.price * b.quantity}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="confirmation-actions">
                        <Link to="/books" className="continue-catalog-btn">
                            Explore More Books
                        </Link>
                        <Link to="/" className="back-home-btn">
                            Back to Home
                        </Link>
                    </div>
                </motion.div>
            </div>
        )
    }

    // If Cart is empty and no placed order
    if (cartItems.length === 0) {
        return (
            <div className="checkout-page-container">
                <div className="empty-checkout-card">
                    <FiPackage className="empty-box-icon" />
                    <h2>No Items to Checkout</h2>
                    <p>Your shopping basket is currently empty. Please add titles before heading to checkout.</p>
                    <Link to="/books" className="continue-catalog-btn">
                        Explore Catalog
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="checkout-page-container">
            <div className="checkout-content-wrapper">
                {/* Breadcrumbs */}
                <nav className="checkout-breadcrumbs" aria-label="Breadcrumb">
                    <Link to="/">Home</Link>
                    <span className="crumb-sep">/</span>
                    <Link to="/cart">Cart</Link>
                    <span className="crumb-sep">/</span>
                    <span className="crumb-active">Secure Checkout</span>
                </nav>

                <h1 className="checkout-page-title">Checkout</h1>
                <p className="checkout-page-subtitle">
                    Fast & secure checkout • Encrypted transaction
                </p>

                {errorMessage && (
                    <div className="checkout-error-banner">
                        {errorMessage}
                    </div>
                )}

                <div className="checkout-main-grid">
                    {/* Left Column: Checkout Steps Form */}
                    <form className="checkout-form-steps" onSubmit={handlePlaceOrder}>
                        {/* Step 1: Shipping Address */}
                        <section className="checkout-step-card">
                            <div className="step-card-header">
                                <span className="step-number">1</span>
                                <div>
                                    <h2 className="step-title">Delivery Address</h2>
                                    <p className="step-desc">Where should we deliver your books?</p>
                                </div>
                                {isAuthenticated && user && (
                                    <span className="user-prefill-badge">
                                        <FiUser /> {user.name}
                                    </span>
                                )}
                            </div>

                            <div className="step-inputs-grid">
                                <div className="form-field full-width">
                                    <label htmlFor="checkout-fullname">Full Name *</label>
                                    <div className="input-with-icon">
                                        <FiUser className="field-icon" />
                                        <input
                                            id="checkout-fullname"
                                            type="text"
                                            placeholder="Recipient's Name"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="checkout-email">Email Address *</label>
                                    <div className="input-with-icon">
                                        <FiMail className="field-icon" />
                                        <input
                                            id="checkout-email"
                                            type="email"
                                            placeholder="for invoice & tracking"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="checkout-phone">Mobile Number *</label>
                                    <div className="input-with-icon">
                                        <FiPhone className="field-icon" />
                                        <input
                                            id="checkout-phone"
                                            type="tel"
                                            placeholder="10-digit mobile number"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field full-width">
                                    <label htmlFor="checkout-address">Street Address / Flat / Floor *</label>
                                    <div className="input-with-icon">
                                        <FiMapPin className="field-icon" />
                                        <input
                                            id="checkout-address"
                                            type="text"
                                            placeholder="House number, apartment name, street"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="checkout-city">City *</label>
                                    <input
                                        id="checkout-city"
                                        type="text"
                                        placeholder="City"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label htmlFor="checkout-state">State *</label>
                                    <select
                                        id="checkout-state"
                                        value={stateName}
                                        onChange={(e) => setStateName(e.target.value)}
                                    ><option value="Andhra Pradesh">Andhra Pradesh</option>
                                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                        <option value="Assam">Assam</option>
                                        <option value="Bihar">Bihar</option>
                                        <option value="Chhattisgarh">Chhattisgarh</option>
                                        <option value="Delhi">Delhi NCR</option>
                                        <option value="Goa">Goa</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Haryana">Haryana</option>
                                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                                        <option value="Jharkhand">Jharkhand</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Kerala">Kerala</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Manipur">Manipur</option>
                                        <option value="Meghalaya">Meghalaya</option>
                                        <option value="Mizoram">Mizoram</option>
                                        <option value="Nagaland">Nagaland</option>
                                        <option value="Odisha">Odisha</option>
                                        <option value="Punjab">Punjab</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                        <option value="Sikkim">Sikkim</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Telangana">Telangana</option>
                                        <option value="Tripura">Tripura</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="Uttarakhand">Uttarakhand</option>
                                        <option value="West Bengal">West Bengal</option>
                                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                        <option value="Chandigarh">Chandigarh</option>
                                        <option value="Dadra and Nagar Haveli">Dadra and Nagar Haveli</option>
                                        <option value="Daman and Diu">Daman and Diu</option>
                                        <option value="Lakshadweep">Lakshadweep</option>
                                        <option value="Puducherry">Puducherry</option>

                                    </select>
                                </div>

                                <div className="form-field">
                                    <label htmlFor="checkout-pincode">PIN Code *</label>
                                    <input
                                        id="checkout-pincode"
                                        type="text"
                                        placeholder="6-digit PIN code"
                                        value={pinCode}
                                        onChange={(e) => setPinCode(e.target.value)}
                                        maxLength={6}
                                        required
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Step 2: Delivery Speed */}
                        <section className="checkout-step-card">
                            <div className="step-card-header">
                                <span className="step-number">2</span>
                                <div>
                                    <h2 className="step-title">Delivery Speed</h2>
                                    <p className="step-desc">Choose how quickly you need your books</p>
                                </div>
                            </div>

                            <div className="delivery-options-group">
                                <label className={`delivery-option-pill ${shippingSpeed === 'standard' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="shippingSpeed"
                                        value="standard"
                                        checked={shippingSpeed === 'standard'}
                                        onChange={() => setShippingSpeed('standard')}
                                    />
                                    <div className="delivery-option-text">
                                        <div className="option-title-row">
                                            <strong>Standard Editorial Courier</strong>
                                            <span className="option-cost">
                                                {baseShipping === 0 ? 'FREE' : '₹50'}
                                            </span>
                                        </div>
                                        <span className="option-time">Estimated delivery in 3 to 5 business days</span>
                                    </div>
                                </label>

                                <label className={`delivery-option-pill ${shippingSpeed === 'express' ? 'active' : ''}`}>
                                    <input
                                        type="radio"
                                        name="shippingSpeed"
                                        value="express"
                                        checked={shippingSpeed === 'express'}
                                        onChange={() => setShippingSpeed('express')}
                                    />
                                    <div className="delivery-option-text">
                                        <div className="option-title-row">
                                            <strong>Express Priority Book Courier</strong>
                                            <span className="option-cost">+₹99</span>
                                        </div>
                                        <span className="option-time">Priority dispatch • 1 to 2 business days</span>
                                    </div>
                                </label>
                            </div>
                        </section>

                        {/* Step 3: Payment Method */}
                        <section className="checkout-step-card">
                            <div className="step-card-header">
                                <span className="step-number">3</span>
                                <div>
                                    <h2 className="step-title">Payment Method</h2>
                                    <p className="step-desc">All transactions are encrypted with 256-bit SSL</p>
                                </div>
                            </div>

                            <div className="payment-methods-tabs">
                                <button
                                    type="button"
                                    className={`payment-tab-btn ${paymentMethod === 'upi' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('upi')}
                                >
                                    <FiSmartphone />
                                    <span>UPI / QR</span>
                                </button>
                                <button
                                    type="button"
                                    className={`payment-tab-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <FiCreditCard />
                                    <span>Card</span>
                                </button>
                                <button
                                    type="button"
                                    className={`payment-tab-btn ${paymentMethod === 'cod' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('cod')}
                                >
                                    <FiDollarSign />
                                    <span>Cash on Delivery</span>
                                </button>
                            </div>

                            {/* UPI Panel */}
                            {paymentMethod === 'upi' && (
                                <div className="payment-panel">
                                    <label htmlFor="checkout-upi">Virtual Payment Address (VPA / UPI ID)</label>
                                    <div className="input-with-icon">
                                        <FiSmartphone className="field-icon" />
                                        <input
                                            id="checkout-upi"
                                            type="text"
                                            placeholder="e.g. mobileNumber@upi or reader@okhdfcbank"
                                            value={upiId}
                                            onChange={(e) => setUpiId(e.target.value)}
                                        />
                                    </div>
                                    <div className="supported-upi-apps">
                                        <span>Supported Apps:</span>
                                        <span className="upi-app-tag">Google Pay</span>
                                        <span className="upi-app-tag">PhonePe</span>
                                        <span className="upi-app-tag">Paytm</span>
                                        <span className="upi-app-tag">BHIM</span>
                                    </div>
                                </div>
                            )}

                            {/* Card Panel */}
                            {paymentMethod === 'card' && (
                                <div className="payment-panel card-inputs-grid">
                                    <div className="form-field full-width">
                                        <label htmlFor="checkout-card-num">Card Number</label>
                                        <div className="input-with-icon">
                                            <FiCreditCard className="field-icon" />
                                            <input
                                                id="checkout-card-num"
                                                type="text"
                                                placeholder="4532 •••• •••• 8921"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(e.target.value)}
                                                maxLength={19}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-field full-width">
                                        <label htmlFor="checkout-card-name">Cardholder Name</label>
                                        <input
                                            id="checkout-card-name"
                                            type="text"
                                            placeholder="Name as printed on card"
                                            value={cardHolder}
                                            onChange={(e) => setCardHolder(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="checkout-card-exp">Expiry (MM/YY)</label>
                                        <input
                                            id="checkout-card-exp"
                                            type="text"
                                            placeholder="12/28"
                                            value={cardExpiry}
                                            onChange={(e) => setCardExpiry(e.target.value)}
                                            maxLength={5}
                                        />
                                    </div>
                                    <div className="form-field">
                                        <label htmlFor="checkout-card-cvv">CVV</label>
                                        <input
                                            id="checkout-card-cvv"
                                            type="password"
                                            placeholder="•••"
                                            value={cardCvv}
                                            onChange={(e) => setCardCvv(e.target.value)}
                                            maxLength={4}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* COD Panel */}
                            {paymentMethod === 'cod' && (
                                <div className="payment-panel cod-panel">
                                    <div className="cod-alert-box">
                                        <FiCheck className="cod-icon" />
                                        <div>
                                            <strong>Cash / UPI on Delivery Available</strong>
                                            <p>You can pay via cash or scan a dynamic QR code using any UPI app upon delivery.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <button
                            type="submit"
                            className="place-order-submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="submitting-spinner-row">
                                    <span className="spinner-dot" /> Authorizing Payment...
                                </span>
                            ) : (
                                <>
                                    <FiLock /> Complete Order — ₹{finalTotal}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Right Column: Order Review Sidebar */}
                    <aside className="checkout-summary-sidebar">
                        <div className="checkout-review-card">
                            <h2 className="review-card-title">Order Review ({cartItems.length} items)</h2>

                            <ul className="checkout-items-list">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="checkout-item-row">
                                        <img src={item.image} alt={item.title} className="checkout-thumb" />
                                        <div className="checkout-item-info">
                                            <span className="checkout-book-title">{item.title}</span>
                                            <span className="checkout-book-author">by {item.author}</span>
                                            <span className="checkout-qty-tag">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="checkout-item-price">
                                            ₹{item.price * item.quantity}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="checkout-breakdown">
                                <div className="breakdown-row">
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="breakdown-row discount">
                                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                                        <span>-₹{discountAmount}</span>
                                    </div>
                                )}
                                {giftWrapFee > 0 && (
                                    <div className="breakdown-row">
                                        <span>Gift Packaging</span>
                                        <span>₹{giftWrapFee}</span>
                                    </div>
                                )}
                                <div className="breakdown-row">
                                    <span>Shipping</span>
                                    <span>{finalShipping === 0 ? 'FREE' : `₹${finalShipping}`}</span>
                                </div>

                                <div className="breakdown-divider" />

                                <div className="breakdown-row total">
                                    <span>Total Payable</span>
                                    <span className="checkout-final-sum">₹{finalTotal}</span>
                                </div>
                            </div>

                            <div className="checkout-trust-box">
                                <div className="trust-point">
                                    <FiShield /> <span>Guaranteed authentic publisher prints</span>
                                </div>
                                <div className="trust-point">
                                    <FiTruck /> <span>Insured delivery with real-time tracking</span>
                                </div>
                            </div>

                            <Link to="/cart" className="back-to-cart-link">
                                <FiArrowLeft /> Modify Cart Items
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

export default Checkout
