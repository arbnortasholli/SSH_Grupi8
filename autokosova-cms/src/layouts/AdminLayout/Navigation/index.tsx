// @ts-nocheck
import { useContext } from 'react';

// project imports
import NavContent from './NavContent';
import { ConfigContext } from 'contexts/ConfigContext';
import useWindowSize from 'hooks/useWindowSize';
import navigation from 'menu-items';
import navitemcollapse from 'menu-items-collapse';
import * as actionType from 'store/actions';
import { hasAllowedRole } from 'config/roleAccess';
import authService from 'utils/authService';

// assets
import avatar2 from 'assets/images/user/avatar-2.jpg';

// -----------------------|| NAVIGATION ||-----------------------//

export default function Navigation() {
  const configContext = useContext(ConfigContext);
  const { collapseMenu, collapseLayout } = configContext.state;
  const windowSize = useWindowSize();
  const { dispatch } = configContext;
  const user = authService.getUser();

  const filterNavigationByRole = (items) =>
    items
      .map((item) => {
        if (item.children) {
          const children = item.children.filter((child) => hasAllowedRole(user, child.allowedRoles));

          if (children.length === 0) {
            return null;
          }

          return {
            ...item,
            children
          };
        }

        return hasAllowedRole(user, item.allowedRoles) ? item : null;
      })
      .filter(Boolean);

  const navToggleHandler = () => {
    dispatch({ type: actionType.COLLAPSE_MENU });
  };

  let navClass = 'dark-sidebar';

  const navItems = filterNavigationByRole(collapseLayout ? navitemcollapse.items : navigation.items);
  let navContent = <NavContent navigation={navItems} />;
  navClass = [...navClass, 'pc-sidebar'];
  if (windowSize.width <= 1024 && collapseMenu) {
    navClass = [...navClass, 'mob-sidebar-active'];
  } else if (collapseMenu) {
    navClass = [...navClass, 'navbar-collapsed'];
  }

  let navBarClass = ['navbar-wrapper'];

  let mobileOverlay = <></>;
  if (windowSize.width <= 1024 && collapseMenu) {
    mobileOverlay = <div className="pc-menu-overlay" onClick={navToggleHandler} aria-hidden="true" />;
  }

  let navContentDOM = <div className={navBarClass.join(' ')}>{navContent}</div>;

  return (
    <nav className={navClass.join(' ')}>
      {navContentDOM}
      {mobileOverlay}
    </nav>
  );
}
