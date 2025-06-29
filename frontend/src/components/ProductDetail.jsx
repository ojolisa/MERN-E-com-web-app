import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../contexts/CartContext'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [id])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const product = await api.products.getById(id)
      setProduct(product)
    } catch (error) {
      console.error('Failed to load product:', error)
      navigate('/products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true)
      await addToCart(product, quantity)
      // You could show a success message here
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setAddingToCart(false)
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

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading product...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="product-detail">
      <div className="container">
        <nav className="breadcrumb">
          <span onClick={() => navigate('/')} className="breadcrumb-link">Home</span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={() => navigate('/products')} className="breadcrumb-link">Products</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-detail-content">
          <div className="product-images">
            <div className="main-image">
              <img 
                src={product.images?.[selectedImage] || '/api/placeholder/400/400'} 
                alt={product.name}
                className="product-image"
              />
              {calculateDiscountPercentage() > 0 && (
                <div className="discount-badge">
                  -{calculateDiscountPercentage()}%
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="image-thumbnails">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
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
              <span className="rating-text">
                ({product.rating?.average ? product.rating.average.toFixed(1) : 'No rating'})
              </span>
            </div>

            <div className="product-price">
              <span className="current-price">${getCurrentPrice()?.toFixed(2)}</span>
              {product.discountPrice && product.discountPrice < product.price && (
                <span className="original-price">${product.price.toFixed(2)}</span>
              )}
            </div>

            <div className="product-category">
              <span className="category-label">Category:</span>
              <span className="category-value">{product.category}</span>
            </div>

            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            {product.stock > 0 ? (
              <div className="purchase-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <div className="quantity-controls">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn btn-secondary btn-small"
                    >
                      -
                    </button>
                    <input
                      id="quantity"
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="quantity-input"
                    />
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="btn btn-secondary btn-small"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="stock-info">
                  <span className={`stock-status ${product.stock < 10 ? 'low-stock' : 'in-stock'}`}>
                    {product.stock < 10 ? `Only ${product.stock} left!` : 'In Stock'}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="btn btn-primary btn-large add-to-cart-btn"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            ) : (
              <div className="out-of-stock">
                <span className="stock-status out-of-stock">Out of Stock</span>
                <p>This product is currently unavailable.</p>
              </div>
            )}

            <div className="product-features">
              <h3>Features</h3>
              <ul>
                <li>High quality materials</li>
                <li>Fast shipping available</li>
                <li>30-day return policy</li>
                <li>Customer satisfaction guarantee</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
