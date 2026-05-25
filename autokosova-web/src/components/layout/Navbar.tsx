import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/buy', label: 'Buy Cars' },
  { to: '/rent', label: 'Rent Cars' },
  { to: '/korean-cars', label: 'Korean Cars' },
];

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const isRental = user?.role === 'Rental';
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const canRequestTenant = isAuthenticated && !user?.tenantID && user?.role !== 'Rental' && user?.role !== 'SuperAdmin';
  const visibleNavLinks = isRental
    ? [
      { to: '/seller', label: 'My cars' },
      { to: '/seller/add-car', label: 'Add rental car' },
    ]
    : navLinks;
  const accountLink = isRental
    ? { to: '/seller', label: 'My cars' }
    : isSuperAdmin
      ? { to: '/dashboard', label: 'Admin area' }
      : { to: '/dashboard', label: 'My rentals' };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="ak-container nav-shell">
        <Link to="/" className="brand-link" aria-label="AutoKosova home">
          <span className="brand-wordmark">AutoKosova</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {visibleNavLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {canRequestTenant && (
                <Link to="/tenant-request" className="nav-tenant">
                  Tenant request
                </Link>
              )}
              {!isRental && (
                <>
                  <Link to="/import-requests" className="nav-login">
                    My requests
                  </Link>
                  <Link to={accountLink.to} className="nav-login">
                    {accountLink.label}
                  </Link>
                </>
              )}
              <button type="button" className="nav-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Login
              </Link>
              <Link to="/register" className="nav-register">
                Register
              </Link>
            </>
          )}
        </div>

        <button className="nav-toggle" type="button" onClick={() => setIsOpen((current) => !current)}>
          <span />
          <span />
          <span />
        </button>
      </div>

      {isOpen && (
        <div className="mobile-nav ak-container">
          {visibleNavLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <div className="mobile-nav__actions">
            {isAuthenticated ? (
              <>
                {canRequestTenant && (
                  <Link to="/tenant-request" onClick={() => setIsOpen(false)}>
                    Tenant request
                  </Link>
                )}
                {!isRental && (
                  <>
                    <Link to="/import-requests" onClick={() => setIsOpen(false)}>
                      My requests
                    </Link>
                    <Link to={accountLink.to} onClick={() => setIsOpen(false)}>
                      {accountLink.label}
                    </Link>
                  </>
                )}
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
