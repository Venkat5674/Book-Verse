import { Link } from 'react-router-dom'
import './MegaMenu.css'

const MegaMenu = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null
    }

    return (
        <div className="mega-menu" role="region" aria-label="Book categories">
            <div className="mega-menu-container">
                <div className="mega-column">
                    <h3><Link to="/books?category=fiction" onClick={onClose}>Fiction</Link></h3>
                    <Link to="/books?category=fiction&genre=literary-fiction" onClick={onClose}>Literary Fiction</Link>
                    <Link to="/books?category=fiction&genre=romance" onClick={onClose}>Romance</Link>
                    <Link to="/books?category=fiction&genre=mystery-thriller" onClick={onClose}>Mystery & Thriller</Link>
                    <Link to="/books?category=fiction&genre=fantasy" onClick={onClose}>Fantasy</Link>
                    <Link to="/books?category=fiction&genre=sci-fi" onClick={onClose}>Science Fiction</Link>
                </div>
                <div className="mega-column">
                    <h3><Link to="/books?category=non-fiction" onClick={onClose}>Non-Fiction</Link></h3>
                    <Link to="/books?category=non-fiction&genre=self-help" onClick={onClose}>Self Help</Link>
                    <Link to="/books?category=non-fiction&genre=biography" onClick={onClose}>Biography</Link>
                    <Link to="/books?category=non-fiction&genre=business" onClick={onClose}>Business</Link>
                    <Link to="/books?category=non-fiction&genre=psychology" onClick={onClose}>Psychology</Link>
                    <Link to="/books?category=non-fiction&genre=history" onClick={onClose}>History</Link>
                </div>
                <div className="mega-column">
                    <h3><Link to="/books?category=young-readers" onClick={onClose}>Young Readers</Link></h3>
                    <Link to="/books?category=young-readers&genre=childrens-books" onClick={onClose}>Children's Books</Link>
                    <Link to="/books?category=young-readers&genre=young-adult" onClick={onClose}>Young Adult</Link>
                    <Link to="/books?category=young-readers&genre=picture-books" onClick={onClose}>Picture Books</Link>
                    <Link to="/books?category=young-readers&genre=educational" onClick={onClose}>Educational</Link>
                    <Link to="/books?category=young-readers&genre=activity-books" onClick={onClose}>Activity Books</Link>
                </div>
                <div className="mega-featured">
                    <span>DISCOVER</span>
                    <h2>Find your <br /> next story.</h2>
                    <Link to="/books" onClick={onClose}>Explore all books →</Link>
                </div>
            </div>
        </div>
    )
}

export default MegaMenu