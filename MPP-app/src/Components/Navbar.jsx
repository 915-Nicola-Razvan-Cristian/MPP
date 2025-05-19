import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Library App
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/authors" className="nav-link">Authors</Link>
          <Link to="/charts" className="nav-link">Charts</Link>
          {isAuthenticated && (
            <>
              <Link to="/addform" className="nav-link">Add Book</Link>
              <Link to="/collection" className="nav-link collection-link">My Collection</Link>
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" className="nav-link admin-link">Admin Dashboard</Link>
              )}
            </>
          )}
        </div>
        
        <div className="navbar-auth">
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="username">
                {user.username} ({user.role})
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-button">Login</Link>
              <Link to="/register" className="register-button">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 