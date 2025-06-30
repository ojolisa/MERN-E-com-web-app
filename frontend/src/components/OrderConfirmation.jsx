import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      const order = await api.orders.getById(orderId);
      setOrder(order);
    } catch (error) {
      console.error("Failed to load order:", error);
      setError(error.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="error-message">
            <h2>Order not found</h2>
            <p>
              {error ||
                "The order you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <div className="error-actions">
              <Link to="/profile" className="btn btn-primary">
                View All Orders
              </Link>
              <Link to="/products" className="btn btn-outline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p>
            Thank you for your purchase. Your order has been received and is
            being processed.
          </p>
        </div>

        <div className="order-details">
          <div className="order-info-card">
            <h2>Order Information</h2>
            <div className="order-meta">
              <div className="meta-item">
                <label>Order Number:</label>
                <span className="order-number">#{order._id.slice(-8)}</span>
              </div>
              <div className="meta-item">
                <label>Order Date:</label>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="meta-item">
                <label>Status:</label>
                <span
                  className={`status-badge status-${
                    order.status?.toLowerCase() || "pending"
                  }`}
                >
                  {order.status || "Pending"}
                </span>
              </div>
              <div className="meta-item">
                <label>Total Amount:</label>
                <span className="total-amount">
                  ${order.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="shipping-info-card">
            <h3>Shipping Address</h3>
            <div className="address">
              <p>{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.address}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.zipCode}
              </p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          <div className="order-items-card">
            <h3>Order Items</h3>
            <div className="items-list">
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img
                      src={
                        item.product?.images?.[0] || "/api/placeholder/80/80"
                      }
                      alt={item.product?.name || "Product"}
                    />
                  </div>
                  <div className="item-details">
                    <h4 className="item-name">
                      <Link to={`/products/${item.product?._id}`}>
                        {item.product?.name || "Product name unavailable"}
                      </Link>
                    </h4>
                    <p className="item-category">{item.product?.category}</p>
                    <div className="item-quantity">
                      Quantity: {item.quantity}
                    </div>
                  </div>
                  <div className="item-price">
                    <span className="unit-price">
                      ${item.price?.toFixed(2)} each
                    </span>
                    <span className="total-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-summary-card">
            <h3>Order Summary</h3>
            <div className="summary-lines">
              <div className="summary-line">
                <span>Subtotal:</span>
                <span>${(order.totalAmount / 1.08).toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-line">
                <span>Tax:</span>
                <span>
                  ${(order.totalAmount - order.totalAmount / 1.08).toFixed(2)}
                </span>
              </div>
              <div className="summary-line total">
                <span>Total:</span>
                <span>${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
          <Link to="/profile" className="btn btn-outline">
            View All Orders
          </Link>
          <button onClick={() => window.print()} className="btn btn-secondary">
            Print Order
          </button>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Order Processing</h4>
                <p>
                  We'll prepare your items for shipping within 1-2 business
                  days.
                </p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Shipping</h4>
                <p>You'll receive a tracking number once your order ships.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Delivery</h4>
                <p>Your order will arrive within 3-7 business days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;
