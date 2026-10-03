import { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import './BookCard.css'

const BookCard = ({ book }) => {
    const {
        id,
        title,
        author,
        price,
        originalPrice,
        rating,
        reviews,
        image,
        badge,
    } = book

    const discount = Math.round(
        ((originalPrice - price) / originalPrice) * 100,
    )

    const { addToCart } = useCart()
    const { isFavorite, toggleFavorite } = useFavorites()
    const isFav = isFavorite(id)
    const [isAdded, setIsAdded] = useState(false)

    const handleAddToCart = (e) => {
        e.preventDefault()
        e.stopPropagation()
        addToCart(book, 1)
        setIsAdded(true)
        setTimeout(() => setIsAdded(false), 1400)
    }

    const handleWishlistClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(book)
    }

    const handleCardClick = () => {
        try {
            sessionStorage.setItem(`bookverse_book_${id}`, JSON.stringify(book))
        } catch {
            // ignore storage errors
        }
    }

    return (
        <motion.article
            className="book-card"
            whileHover={{ y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            <Link
                to={`/books/${id}`}
                state={{ book }}
                onClick={handleCardClick}
                className="book-card-image-wrapper"
            >
                <div className="book-card-badge">
                    {badge}
                </div>

                <img
                    src={image}
                    alt={title}
                    className="book-card-image"
                />

                <button
                    type="button"
                    className={`book-wishlist ${isFav ? 'is-favorite' : ''}`}
                    aria-label={isFav ? `Remove ${title} from favorites` : `Add ${title} to favorites`}
                    title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                    onClick={handleWishlistClick}
                >
                    <span className="heart-icon">{isFav ? '♥' : '♡'}</span>
                </button>
            </Link>

            <div className="book-card-content">
                <p className="book-card-category">
                    {book.category}
                </p>

                <Link
                    to={`/books/${id}`}
                    state={{ book }}
                    onClick={handleCardClick}
                    className="book-card-title"
                >
                    {title}
                </Link>

                <p className="book-card-author">
                    by {author}
                </p>

                <div className="book-card-rating">
                    <span className="rating-star">★</span>
                    <span>{rating}</span>
                    <span className="rating-reviews">
                        ({reviews.toLocaleString()})
                    </span>
                </div>

                <div className="book-card-footer">
                    <div className="book-price">
                        <span className="current-price">
                            ₹{price}
                        </span>

                        <span className="original-price">
                            ₹{originalPrice}
                        </span>

                        <span className="discount">
                            {discount}% OFF
                        </span>
                    </div>

                    <button
                        type="button"
                        className={`add-cart-button ${isAdded ? 'added' : ''}`}
                        onClick={handleAddToCart}
                        aria-label={`Add ${title} to cart`}
                    >
                        {isAdded ? 'Added ✓' : 'Add'}
                    </button>
                </div>
            </div>
        </motion.article>
    )
}

export default BookCard