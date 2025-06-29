import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Header({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.auth.logout()
      onLogout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="header">
      <div className="container">
        <div className="nav">
          <Link to="/" className="logo">
            <h1>ShopEasy</h1>
          </Link>
          <nav className="nav-links">
            <Link to="/#products">Products</Link>
            <Link to="/#about">About</Link>
            <Link to="/#contact">Contact</Link>
          </nav>
          <div className="auth-buttons">
            {user ? (
              <div className="user-menu">
                <span className="welcome">Welcome, {user.name}!</span>
                <button className="btn btn-secondary" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
