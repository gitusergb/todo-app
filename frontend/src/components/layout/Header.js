import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiSettings } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            📝 Todo App
          </Link>
          
          <nav className="nav-links">
            <Link to="/dashboard" className="nav-link">
              {user?.role === 'admin' ? (
                <>
                  <FiSettings /> Admin Dashboard
                </>
              ) : (
                'Dashboard'
              )}
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiUser />
                {user?.firstName} {user?.lastName}
                {user?.role === 'admin' && (
                  <span style={{ 
                    background: '#667eea', 
                    color: 'white', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem' 
                  }}>
                    Admin
                  </span>
                )}
              </span>
              
              <button 
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
