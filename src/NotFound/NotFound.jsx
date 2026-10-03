import { Link } from 'react-router-dom'
import { FiHome, FiBookOpen, FiShoppingBag, FiArrowLeft } from 'react-icons/fi'
import './NotFound.css'

const NotFound = () => {
    return (
        <main className="not-found-page">
            <div className="not-found-container">
                <div className="not-found-code-badge">404</div>
                <h1 className="not-found-title">Page Not Found</h1>
                <p className="not-found-description">
                    The chapter you are looking for seems to have gone missing or the URL might be
                    misspelled. Let’s guide you back to our shelves.
                </p>

                <div className="not-found-actions">
                    <Link to="/" className="not-found-primary-btn">
                        <FiHome /> Back to Home
                    </Link>
                    <Link to="/books" className="not-found-secondary-btn">
                        <FiBookOpen /> Browse Catalog
                    </Link>
                    <Link to="/cart" className="not-found-secondary-btn">
                        <FiShoppingBag /> View Basket
                    </Link>
                </div>

                <div className="not-found-quick-help">
                    <Link to="/books?sort=bestseller" className="quick-help-link">
                        <FiArrowLeft /> Check out our Bestsellers
                    </Link>
                </div>
            </div>
        </main>
    )
}

export default NotFound
