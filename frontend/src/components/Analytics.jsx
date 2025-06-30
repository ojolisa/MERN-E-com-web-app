import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Analytics.css";

function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    salesTrends: [],
    topProducts: [],
    userGrowth: [],
    revenueByMonth: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [salesData, productsData, usersData, revenueData] =
        await Promise.all([
          api.orders.getSalesAnalytics().catch(() => []),
          api.products.getTopProducts().catch(() => []),
          api.auth.getUserAnalytics().catch(() => []),
          api.orders.getRevenueAnalytics().catch(() => []),
        ]);

      setAnalytics({
        salesTrends: salesData || [],
        topProducts: productsData || [],
        userGrowth: usersData || [],
        revenueByMonth: revenueData || [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data");
      if (error.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <button
            className="back-btn"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="time-range-selector">
          <label>Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card sales-chart">
          <h3>Sales Trends</h3>
          <div className="chart-placeholder">
            <p>Sales trends over the last {timeRange} days</p>
            {analytics.salesTrends.length > 0 ? (
              <div className="simple-chart">
                {analytics.salesTrends.map((item, index) => (
                  <div key={index} className="chart-item">
                    <span className="date">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span className="value">{item.orders} orders</span>
                    <span className="revenue">
                      ${item.revenue?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No sales data available</p>
            )}
          </div>
        </div>

        <div className="analytics-card top-products">
          <h3>Top Products</h3>
          {analytics.topProducts.length > 0 ? (
            <div className="products-list">
              {analytics.topProducts.map((product, index) => (
                <div key={product._id || index} className="product-item">
                  <span className="rank">#{index + 1}</span>
                  <div className="product-info">
                    <span className="name">{product.name}</span>
                    <span className="sales">{product.totalSold || 0} sold</span>
                  </div>
                  <span className="revenue">
                    ${product.revenue?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No product data available</p>
          )}
        </div>

        <div className="analytics-card user-growth">
          <h3>User Growth</h3>
          <div className="growth-stats">
            {analytics.userGrowth.length > 0 ? (
              analytics.userGrowth.map((item, index) => (
                <div key={index} className="growth-item">
                  <span className="period">{item.period}</span>
                  <span className="count">{item.newUsers} new users</span>
                </div>
              ))
            ) : (
              <p>No user growth data available</p>
            )}
          </div>
        </div>

        <div className="analytics-card revenue-chart">
          <h3>Monthly Revenue (Last 12 Months)</h3>
          <div className="revenue-list">
            {analytics.revenueByMonth.length > 0 ? (
              analytics.revenueByMonth.map((item, index) => (
                <div key={index} className="revenue-item">
                  <span className="month">{item.month}</span>
                  <span className="amount">
                    ${item.revenue?.toFixed(2) || "0.00"}
                  </span>
                  <span className="orders">{item.orders} orders</span>
                </div>
              ))
            ) : (
              <p>No revenue data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="analytics-summary">
        <h3>Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Total Revenue (Last {timeRange} days)</span>
            <span className="value">
              $
              {analytics.salesTrends
                .reduce((sum, item) => sum + (item.revenue || 0), 0)
                .toFixed(2)}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Total Orders (Last {timeRange} days)</span>
            <span className="value">
              {analytics.salesTrends.reduce(
                (sum, item) => sum + (item.orders || 0),
                0
              )}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Best Selling Product</span>
            <span className="value">
              {analytics.topProducts[0]?.name || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
