import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/buy', label: 'Buy Cars' },
  { to: '/rent', label: 'Rent Cars' },
];

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const isSeller = user?.role === 'Seller';
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const canRequestTenant = isAuthenticated && !user?.tenantID && user?.role !== 'Seller' && user?.role !== 'SuperAdmin';
  const canListCars = !isAuthenticated || isSuperAdmin;
  const visibleNavLinks = isSeller
    ? [
      { to: '/seller', label: 'My cars' },
      { to: '/seller/add-car', label: 'Add rental car' },
    ]
    : navLinks;
  const accountLink = isSeller
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
          {canListCars && (
            <NavLink to="/rent-your-car" className={({ isActive }) => (isActive ? 'active' : undefined)}>
              Rent Your Car
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {canRequestTenant && (
                <Link to="/tenant-request" className="nav-tenant">
                  Tenant request
                </Link>
              )}
              {!isSeller && (
                <Link to={accountLink.to} className="nav-login">
                  {accountLink.label}
                </Link>
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
          {canListCars && (
            <NavLink to="/rent-your-car" onClick={() => setIsOpen(false)}>
              Rent Your Car
            </NavLink>
          )}
          <div className="mobile-nav__actions">
            {isAuthenticated ? (
              <>
                {canRequestTenant && (
                  <Link to="/tenant-request" onClick={() => setIsOpen(false)}>
                    Tenant request
                  </Link>
                )}
                {!isSeller && (
                  <Link to={accountLink.to} onClick={() => setIsOpen(false)}>
                    {accountLink.label}
                  </Link>
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
