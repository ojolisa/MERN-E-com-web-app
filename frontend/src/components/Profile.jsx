import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Profile({ user }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(user || {});

  useEffect(() => {
    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const orders = await api.orders.getMyOrders();
      setOrders(orders || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return "status-default";
    switch (status.toLowerCase()) {
      case "pending":
        return "status-pending";
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "delivered":
        return "status-delivered";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="auth-required">
            <h2>Please log in to view your profile</h2>
            <Link to="/login" className="btn btn-primary">
              Log In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Account</h1>
          <p>Welcome back, {userProfile.name || userProfile.email}!</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile Information
          </button>
          <button
            className={`tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Order History
          </button>
        </div>

        <div className="profile-content">
          {activeTab === "profile" && (
            <div className="profile-info">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{userProfile.name || "Not provided"}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Role:</label>
                    <span className={`role-badge ${userProfile.role}`}>
                      {userProfile.role || "user"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Member since:</label>
                    <span>
                      {userProfile.createdAt
                        ? formatDate(userProfile.createdAt)
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn btn-primary">Edit Profile</button>
                  <button className="btn btn-outline">Change Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="orders-section">
              <h3>Your Orders</h3>

              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="no-orders">
                  <h4>No orders yet</h4>
                  <p>Start shopping to see your orders here</p>
                  <Link to="/products" className="btn btn-primary">
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h4>Order #{order._id.slice(-8)}</h4>
                          <p className="order-date">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="order-status">
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              order.status
                            )}`}
                          >
                            {order.status || "Unknown"}
                          </span>
                        </div>
                      </div>

                      <div className="order-items">
                        {order.items?.map((item, index) => (
                          <div key={index} className="order-item">
                            <img
                              src={
                                item.product?.images?.[0] ||
                                "/api/placeholder/60/60"
                              }
                              alt={item.product?.name || "Product"}
                              className="item-image"
                            />
                            <div className="item-details">
                              <span className="item-name">
                                {item.product?.name ||
                                  "Product name unavailable"}
                              </span>
                              <span className="item-quantity">
                                Qty: {item.quantity}
                              </span>
                              <span className="item-price">
                                ${item.price?.toFixed(2) || "0.00"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-footer">
                        <div className="order-total">
                          <strong>
                            Total: ${order.totalAmount?.toFixed(2) || "0.00"}
                          </strong>
                        </div>
                        <div className="order-actions">
                          <Link
                            to={`/orders/${order._id}`}
                            className="btn btn-outline btn-small"
                          >
                            View Details
                          </Link>
                          {order.status === "delivered" && (
                            <button className="btn btn-primary btn-small">
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
