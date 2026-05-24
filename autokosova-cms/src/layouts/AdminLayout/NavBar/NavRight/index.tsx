// @ts-nocheck
import { useNavigate } from 'react-router-dom';

// react-bootstrap
import { ListGroup, Dropdown } from 'react-bootstrap';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';
import authService from 'utils/authService';

// -----------------------|| NAV RIGHT ||-----------------------//

export default function NavRight() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  const fullName = [user?.accountName, user?.accountLastname].filter(Boolean).join(' ') || user?.accountUsername || 'Admin User';
  const role = user?.role || 'Administrator';
  const avatar = user?.avatar || user?.profileImageUrl || avatar2;

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <ListGroup as="ul" bsPrefix=" " className="list-unstyled">
      <ListGroup.Item as="li" bsPrefix=" " className="pc-h-item">
        <Dropdown className="drp-user">
          <Dropdown.Toggle as="a" variant="link" className="pc-head-link arrow-none me-0 user-name">
            <img src={avatar} alt={fullName} className="user-avatar" />
            <span>
              <span className="user-name">{fullName}</span>
              <span className="user-desc">{role}</span>
            </span>
          </Dropdown.Toggle>
          <Dropdown.Menu className="dropdown-menu-end pc-h-dropdown">
            <Dropdown.Header className="pro-head">
              <h6 className="text-overflow m-0">{fullName}</h6>
              <span className="text-muted">{role}</span>
            </Dropdown.Header>
            <button type="button" className="dropdown-item" onClick={handleLogout}>
              <i className="material-icons-two-tone">chrome_reader_mode</i> Logout
            </button>
          </Dropdown.Menu>
        </Dropdown>
      </ListGroup.Item>
    </ListGroup>
  );
}
