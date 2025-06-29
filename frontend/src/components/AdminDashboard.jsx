import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: { total: 0, admin: 0, regular: 0 },
    products: { total: 0, active: 0, lowStock: 0 },
    orders: { total: 0, pending: 0, completed: 0, revenue: 0 }
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
    fetchRecentActivity()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all stats in parallel with fallbacks
      const [userStats, productStats, orderStats] = await Promise.all([
        api.auth.getUserStats().catch(() => ({ 
          totalUsers: 0, adminUsers: 0, regularUsers: 0, activeUsers: 0 
        })),
        api.products.getStats().catch(() => ({ 
          total: 0, active: 0, lowStock: 0 
        })),
        api.orders.getStats().catch(() => ({ 
          total: 0, pending: 0, completed: 0, revenue: 0 
        }))
      ])

      setStats({
        users: {
          total: userStats.totalUsers || 0,
          admin: userStats.adminUsers || 0,
          regular: userStats.regularUsers || 0,
          active: userStats.activeUsers || 0
        },
        products: productStats,
        orders: orderStats
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setError('Failed to load some dashboard data')
      if (error.response?.status === 403) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentActivity = async () => {
    try {
      // Get recent orders and users to show activity
      const [recentOrders, recentUsers] = await Promise.all([
        api.orders.getRecent({ limit: 5 }).catch(() => []),
        api.auth.getAllUsers({ limit: 5, sort: '-createdAt' }).catch(() => ({ users: [] }))
      ])

      const activities = []
      
      // Add recent orders
      if (recentOrders && Array.isArray(recentOrders)) {
        recentOrders.forEach(order => {
          activities.push({
            id: `order-${order._id}`,
            type: 'order',
            message: `New order #${order._id.slice(-6)} for $${order.totalAmount?.toFixed(2) || '0.00'}`,
            time: order.createdAt,
            status: order.status
          })
        })
      }

      // Add recent users
      if (recentUsers.users && Array.isArray(recentUsers.users)) {
        recentUsers.users.forEach(user => {
          activities.push({
            id: `user-${user._id}`,
            type: 'user',
            message: `New user registered: ${user.name}`,
            time: user.createdAt,
            status: 'active'
          })
        })
      }

      // Sort by time and take the most recent 8
      activities.sort((a, b) => new Date(b.time) - new Date(a.time))
      setRecentActivity(activities.slice(0, 8))
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      // Set some fallback activity if API fails
      setRecentActivity([])
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to the admin control panel</p>
        <button 
          className="refresh-btn"
          onClick={() => {
            fetchDashboardStats()
            fetchRecentActivity()
          }}
          disabled={loading}
        >
          🔄 Refresh Data
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card users">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Users</h3>
            <div className="stat-number">{stats.users.total}</div>
            <div className="stat-details">
              <span>{stats.users.admin} admin</span>
              <span>{stats.users.regular} regular</span>
            </div>
          </div>
        </div>

        <div className="stat-card products">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Products</h3>
            <div className="stat-number">{stats.products.total}</div>
            <div className="stat-details">
              <span>{stats.products.active} active</span>
              <span>{stats.products.lowStock} low stock</span>
            </div>
          </div>
        </div>

        <div className="stat-card orders">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Orders</h3>
            <div className="stat-number">{stats.orders.total}</div>
            <div className="stat-details">
              <span>{stats.orders.pending} pending</span>
              <span>{stats.orders.completed} completed</span>
            </div>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Revenue</h3>
            <div className="stat-number">${stats.orders.revenue?.toLocaleString() || 0}</div>
            <div className="stat-details">
              <span>Total revenue</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <button 
            className="action-btn users-btn"
            onClick={() => navigate('/admin/users')}
          >
            <span className="action-icon">👥</span>
            <span>Manage Users</span>
          </button>
          
          <button 
            className="action-btn products-btn"
            onClick={() => navigate('/admin/products')}
          >
            <span className="action-icon">📦</span>
            <span>Manage Products</span>
          </button>
          
          <button 
            className="action-btn orders-btn"
            onClick={() => navigate('/admin/orders')}
          >
            <span className="action-icon">🛒</span>
            <span>Manage Orders</span>
          </button>
          
          <button 
            className="action-btn analytics-btn"
            onClick={() => navigate('/admin/analytics')}
          >
            <span className="action-icon">📊</span>
            <span>View Analytics</span>
          </button>
        </div>
      </div>

      <div className="recent-activity">
        <h2>Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="activity-list">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`activity-item ${activity.type}`}>
                <div className="activity-icon">
                  {activity.type === 'order' ? '🛒' : '👤'}
                </div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-time">
                    {new Date(activity.time).toLocaleDateString()} at{' '}
                    {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`activity-status ${activity.status}`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="activity-placeholder">
            <p>No recent activity to display</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
