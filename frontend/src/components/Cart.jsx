import { useCart } from "../contexts/CartContext";
import { Link, useNavigate } from "react-router-dom";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();
  const navigate = useNavigate();

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page (to be implemented)
    navigate("/checkout");
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Your Cart</h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>
            Your Cart ({getTotalItems()}{" "}
            {getTotalItems() === 1 ? "item" : "items"})
          </h1>
          <button onClick={clearCart} className="btn btn-outline btn-small">
            Clear Cart
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product._id} className="cart-item">
                <div className="item-image">
                  <img
                    src={item.product.images?.[0] || "/api/placeholder/100/100"}
                    alt={item.product.name}
                  />
                </div>

                <div className="item-details">
                  <h3 className="item-name">
                    <Link to={`/products/${item.product._id}`}>
                      {item.product.name}
                    </Link>
                  </h3>
                  <p className="item-category">{item.product.category}</p>
                  <div className="item-price">
                    $
                    {(item.product.discountPrice || item.product.price).toFixed(
                      2
                    )}
                    {item.product.discountPrice &&
                      item.product.discountPrice < item.product.price && (
                        <span className="original-price">
                          ${item.product.price.toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>

                <div className="item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.product._id,
                          item.quantity - 1
                        )
                      }
                      className="btn btn-secondary btn-small"
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.product._id,
                          item.quantity + 1
                        )
                      }
                      className="btn btn-secondary btn-small"
                      disabled={item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="item-total">
                  <span className="total-price">
                    $
                    {(
                      (item.product.discountPrice || item.product.price) *
                      item.quantity
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="item-actions">
                  <button
                    onClick={() => removeFromCart(item.product._id)}
                    className="btn btn-danger btn-small"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>

              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>

              <div className="summary-row">
                <span>Tax:</span>
                <span>${(getTotalPrice() * 0.08).toFixed(2)}</span>
              </div>

              <div className="summary-row total">
                <span>Total:</span>
                <span>${(getTotalPrice() * 1.08).toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="btn btn-primary btn-large checkout-btn"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="btn btn-outline btn-large continue-shopping-btn"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
