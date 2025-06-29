import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function UserSettings({ user, onUserUpdate }) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || ''
    }
  })

  // Password change form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Preferences form data
  const [preferencesData, setPreferencesData] = useState({
    currency: user?.preferences?.currency || 'USD',
    language: user?.preferences?.language || 'en',
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
    theme: user?.preferences?.theme || 'light'
  })

  const showMessage = (text, type = 'success') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 3000)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.auth.updateProfile(profileData)
      showMessage('Profile updated successfully!')
      if (onUserUpdate) {
        onUserUpdate(response.user)
      }
    } catch (error) {
      showMessage(error.message || 'Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('New passwords do not match', 'error')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error')
      return
    }

    setLoading(true)

    try {
      await api.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      showMessage('Password changed successfully!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      showMessage(error.message || 'Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.auth.updatePreferences(preferencesData)
      showMessage('Preferences updated successfully!')
    } catch (error) {
      showMessage(error.message || 'Failed to update preferences', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('Please confirm again. All your data will be permanently deleted.')) {
        setLoading(true)
        try {
          await api.auth.deleteAccount()
          showMessage('Account deleted successfully. You will be redirected to the home page.')
          setTimeout(() => {
            localStorage.removeItem('token')
            window.location.href = '/'
          }, 2000)
        } catch (error) {
          showMessage(error.message || 'Failed to delete account', 'error')
        } finally {
          setLoading(false)
        }
      }
    }
  }

  if (!user) {
    return (
      <div className="settings-page">
        <div className="container">
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>Please log in to access your settings.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="container">
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your account information and preferences</p>
        </div>

        {message && (
          <div className={`message ${messageType}`}>
            {message}
          </div>
        )}

        <div className="settings-container">
          <div className="settings-sidebar">
            <nav className="settings-nav">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <span className="nav-icon">👤</span>
                Profile Information
              </button>
              <button
                className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <span className="nav-icon">🔒</span>
                Change Password
              </button>
              <button
                className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
                onClick={() => setActiveTab('preferences')}
              >
                <span className="nav-icon">⚙️</span>
                Preferences
              </button>
              <button
                className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <span className="nav-icon">🗑️</span>
                Account Management
              </button>
            </nav>
          </div>

          <div className="settings-content">
            {activeTab === 'profile' && (
              <div className="settings-section">
                <h2>Profile Information</h2>
                <form onSubmit={handleProfileSubmit} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={user.email}
                      disabled
                      className="disabled-input"
                    />
                    <small className="form-help">Email cannot be changed</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="form-section">
                    <h3>Address Information</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="street">Street Address</label>
                        <input
                          type="text"
                          id="street"
                          value={profileData.address.street}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, street: e.target.value }
                          })}
                          placeholder="123 Main Street"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input
                          type="text"
                          id="city"
                          value={profileData.address.city}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, city: e.target.value }
                          })}
                          placeholder="New York"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="state">State/Province</label>
                        <input
                          type="text"
                          id="state"
                          value={profileData.address.state}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, state: e.target.value }
                          })}
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="zipCode">ZIP/Postal Code</label>
                        <input
                          type="text"
                          id="zipCode"
                          value={profileData.address.zipCode}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, zipCode: e.target.value }
                          })}
                          placeholder="10001"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="country">Country</label>
                        <select
                          id="country"
                          value={profileData.address.country}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, country: e.target.value }
                          })}
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="UK">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="JP">Japan</option>
                          <option value="IN">India</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="settings-section">
                <h2>Change Password</h2>
                <form onSubmit={handlePasswordSubmit} className="settings-form">
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength="6"
                    />
                    <small className="form-help">Password must be at least 6 characters long</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      minLength="6"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="settings-section">
                <h2>Preferences</h2>
                <form onSubmit={handlePreferencesSubmit} className="settings-form">
                  <div className="form-section">
                    <h3>Regional Settings</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="currency">Currency</label>
                        <select
                          id="currency"
                          value={preferencesData.currency}
                          onChange={(e) => setPreferencesData({ ...preferencesData, currency: e.target.value })}
                        >
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                          <option value="GBP">British Pound (GBP)</option>
                          <option value="CAD">Canadian Dollar (CAD)</option>
                          <option value="AUD">Australian Dollar (AUD)</option>
                          <option value="JPY">Japanese Yen (JPY)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="language">Language</label>
                        <select
                          id="language"
                          value={preferencesData.language}
                          onChange={(e) => setPreferencesData({ ...preferencesData, language: e.target.value })}
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="ja">Japanese</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Notifications</h3>
                    <div className="checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={preferencesData.emailNotifications}
                          onChange={(e) => setPreferencesData({ 
                            ...preferencesData, 
                            emailNotifications: e.target.checked 
                          })}
                        />
                        <span className="checkmark"></span>
                        Email notifications for orders and promotions
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={preferencesData.smsNotifications}
                          onChange={(e) => setPreferencesData({ 
                            ...preferencesData, 
                            smsNotifications: e.target.checked 
                          })}
                        />
                        <span className="checkmark"></span>
                        SMS notifications for order updates
                      </label>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3>Appearance</h3>
                    <div className="form-group">
                      <label htmlFor="theme">Theme</label>
                      <select
                        id="theme"
                        value={preferencesData.theme}
                        onChange={(e) => setPreferencesData({ ...preferencesData, theme: e.target.value })}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Preferences'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="settings-section">
                <h2>Account Management</h2>
                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <p>
                    Once you delete your account, there is no going back. Please be certain.
                    All your orders, saved items, and personal data will be permanently deleted.
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
