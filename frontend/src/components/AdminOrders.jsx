import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminOrders.css";

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getAll();
      setOrders(response);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders");
      if (error.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f39c12";
      case "processing":
        return "#3498db";
      case "shipped":
        return "#9b59b6";
      case "delivered":
        return "#27ae60";
      case "cancelled":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-orders">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          ← Back to Dashboard
        </button>
        <h1>Order Management</h1>
      </div>

      <div className="orders-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Order ID, customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat">
          <span className="stat-label">Total Orders:</span>
          <span className="stat-value">{filteredOrders.length}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Pending:</span>
          <span className="stat-value">
            {filteredOrders.filter((o) => o.status === "pending").length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Processing:</span>
          <span className="stat-value">
            {filteredOrders.filter((o) => o.status === "processing").length}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Delivered:</span>
          <span className="stat-value">
            {filteredOrders.filter((o) => o.status === "delivered").length}
          </span>
        </div>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <span className="order-id">#{order._id.slice(-8)}</span>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">
                      {order.user?.name || "Unknown"}
                    </div>
                    <div className="customer-email">
                      {order.user?.email || "N/A"}
                    </div>
                  </div>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className="items-count">
                    {order.items?.length || 0} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </span>
                </td>
                <td>
                  <span className="order-total">
                    ${order.totalAmount?.toFixed(2) || "0.00"}
                  </span>
                </td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusUpdate(order._id, e.target.value)
                    }
                    className="status-select"
                    style={{ borderColor: getStatusColor(order.status) }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <div className="order-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedOrder(order)}
                      title="View Details"
                    >
                      👁️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders">
          <p>No orders found matching your criteria.</p>
        </div>
      )}

      {selectedOrder && (
        <div
          className="order-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="order-info">
                <div className="info-section">
                  <h3>Order Information</h3>
                  <p>
                    <strong>Order ID:</strong> #{selectedOrder._id}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong>Status:</strong>
                    <span
                      className="status-badge"
                      style={{
                        backgroundColor: getStatusColor(selectedOrder.status),
                      }}
                    >
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p>
                    <strong>Total:</strong> $
                    {selectedOrder.totalAmount?.toFixed(2) || "0.00"}
                  </p>
                </div>

                <div className="info-section">
                  <h3>Customer Information</h3>
                  <p>
                    <strong>Name:</strong>{" "}
                    {selectedOrder.user?.name || "Unknown"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.user?.email || "N/A"}
                  </p>
                </div>

                <div className="info-section">
                  <h3>Shipping Address</h3>
                  <div className="address">
                    {selectedOrder.shippingAddress ? (
                      <>
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>
                          {selectedOrder.shippingAddress.city},{" "}
                          {selectedOrder.shippingAddress.state}
                        </p>
                        <p>{selectedOrder.shippingAddress.zipCode}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </>
                    ) : (
                      <p>No shipping address provided</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="order-items">
                <h3>Items Ordered</h3>
                <div className="items-list">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-image">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                          />
                        ) : (
                          <div className="image-placeholder">📦</div>
                        )}
                      </div>
                      <div className="item-details">
                        <h4>{item.product?.name || "Product Name"}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ${item.price?.toFixed(2) || "0.00"}</p>
                        <p>
                          Total: $
                          {(item.price * item.quantity)?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
