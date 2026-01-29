import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, List } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/dashboard" className="logo">
            SubScout
          </Link>
          
          <div className="nav-links">
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Dashboard
            </Link>
            <Link 
              to="/subscriptions" 
              className={`nav-link ${location.pathname === '/subscriptions' ? 'active' : ''}`}
            >
              <List size={18} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Subscriptions
            </Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="mono" style={{ color: 'var(--gray-light)', fontSize: '0.875rem' }}>
                {user?.firstName} {user?.lastName}
              </span>
              <button onClick={handleLogout} className="btn btn-sm btn-secondary">
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;