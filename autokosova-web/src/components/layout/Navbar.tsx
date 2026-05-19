import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/buy', label: 'Buy Cars' },
  { to: '/rent', label: 'Rent Cars' },
  { to: '/rent-your-car', label: 'Rent Your Car' },
];

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="site-header">
      <div className="ak-container nav-shell">
        <Link to="/" className="brand-link" aria-label="AutoKosova home">
          <span className="brand-wordmark">AutoKosova</span>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <Link to="/login" className="nav-login">
            Login
          </Link>
          <Link to="/register" className="nav-register">
            Register
          </Link>
        </div>

        <button className="nav-toggle" type="button" onClick={() => setIsOpen((current) => !current)}>
          <span />
          <span />
          <span />
        </button>
      </div>

      {isOpen && (
        <div className="mobile-nav ak-container">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setIsOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <div className="mobile-nav__actions">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              Login
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
