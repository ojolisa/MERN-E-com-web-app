import { Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'

function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = async (e) => {
    e.preventDefault() // Prevent navigation when clicking add to cart
    try {
      await addToCart(product, 1)
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const calculateDiscountPercentage = () => {
    if (product.discountPrice && product.discountPrice < product.price) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100)
    }
    return 0
  }

  const getCurrentPrice = () => {
    return product.discountPrice && product.discountPrice < product.price 
      ? product.discountPrice 
      : product.price
  }

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-link">
        <div className="product-image-container">
          <img 
            src={product.images?.[0] || '/api/placeholder/300/300'} 
            alt={product.name}
            className="product-image"
          />
          {calculateDiscountPercentage() > 0 && (
            <div className="discount-badge">
              -{calculateDiscountPercentage()}%
            </div>
          )}
          {product.stock === 0 && (
            <div className="out-of-stock-overlay">
              <span>Out of Stock</span>
            </div>
          )}
        </div>

        <div className="product-info">
          <h3 className="product-name">{product.name}</h3>
          
          <div className="product-category">
            {product.category}
          </div>

          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`star ${i < Math.floor(product.rating?.average || 0) ? 'filled' : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="rating-count">
              ({product.rating?.average ? product.rating.average.toFixed(1) : '0.0'})
            </span>
          </div>

          <div className="product-price">
            <span className="current-price">${getCurrentPrice()?.toFixed(2)}</span>
            {product.discountPrice && product.discountPrice < product.price && (
              <span className="original-price">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="product-description">
            {product.description.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description
            }
          </p>
        </div>
      </Link>

      <div className="product-actions">
        {product.stock > 0 ? (
          <button 
            onClick={handleAddToCart}
            className="btn btn-primary btn-small add-to-cart-btn"
          >
            Add to Cart
          </button>
        ) : (
          <button 
            disabled
            className="btn btn-secondary btn-small"
          >
            Out of Stock
          </button>
        )}
        
        <Link 
          to={`/products/${product._id}`}
          className="btn btn-outline btn-small"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}

export default ProductCard
