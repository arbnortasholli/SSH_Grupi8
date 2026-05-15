import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="ak-container footer-grid">
      <div>
        <div className="footer-brand">AutoKosova</div>
        <p>Buy, sell, and rent cars across Kosovo with a cleaner marketplace experience.</p>
      </div>
      <div>
        <h4>Marketplace</h4>
        <Link to="/buy">Cars for sale</Link>
        <Link to="/rent">Rental cars</Link>
        <Link to="/seller">Sell your car</Link>
      </div>
      <div>
        <h4>Popular cities</h4>
        <span>Prishtina</span>
        <span>Prizren</span>
        <span>Peja</span>
      </div>
      <div>
        <h4>Contact</h4>
        <a href="mailto:info@autokosova.com">info@autokosova.com</a>
        <span>Prishtina, Kosovo</span>
      </div>
    </div>
    <div className="ak-container footer-bottom">
      <span>© {new Date().getFullYear()} AutoKosova</span>
      <span>Built for Kosovo drivers</span>
    </div>
  </footer>
);
