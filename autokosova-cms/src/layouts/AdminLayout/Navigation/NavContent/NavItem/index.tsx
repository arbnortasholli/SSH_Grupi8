// @ts-nocheck
import PropTypes from 'prop-types';
import { useContext, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

// react-bootstrap
import { ListGroup } from 'react-bootstrap';

// third party
import FeatherIcon from 'feather-icons-react';

// project imports
import NavIcon from '../NavIcon';
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import useWindowSize from 'hooks/useWindowSize';
import apiClient from 'config/apiClient';

// -----------------------|| NAV ITEM ||-----------------------//

export default function NavItem({ item }) {
  const windowSize = useWindowSize();
  const configContext = useContext(ConfigContext);
  const { dispatch } = configContext;
  const [pendingTenantRequests, setPendingTenantRequests] = useState(0);
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // @ts-ignore
  const location = useLocation();

  useEffect(() => {
    if (item.id !== 'tenant-requests') return;

    let isMounted = true;

    const getResponseList = (payload) => {
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.Data)) return payload.Data;
      if (Array.isArray(payload?.$values)) return payload.$values;
      if (Array.isArray(payload?.data?.$values)) return payload.data.$values;
      if (Array.isArray(payload?.Data?.$values)) return payload.Data.$values;

      return [];
    };

    const loadPendingTenantRequests = async () => {
      try {
        const response = await apiClient.get('/tenant-requests');
        const pendingCount = getResponseList(response.data).filter((tenantRequest) => {
          const status = tenantRequest.status ?? tenantRequest.Status;
          return status === 'Pending';
        }).length;

        if (isMounted) {
          setPendingTenantRequests(pendingCount);
        }
      } catch {
        if (isMounted) {
          setPendingTenantRequests(0);
        }
      }
    };

    void loadPendingTenantRequests();

    window.addEventListener('focus', loadPendingTenantRequests);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', loadPendingTenantRequests);
    };
  }, [item.id]);

  const pendingDot = item.id === 'tenant-requests' && pendingTenantRequests > 0 ? (
    <span className="tenant-request-dot" aria-label={`${pendingTenantRequests} pending tenant requests`} title={`${pendingTenantRequests} pending`} />
  ) : null;

  let itemTitle = item.title;
  if (item.icon) {
    itemTitle = (
      <>
        <span className="pc-mtext">
          {item.title}
          {pendingDot}
        </span>
        {item.type === 'collapse' && (
          <span className="pc-arrow">
            <FeatherIcon icon="chevron-right" />
          </span>
        )}
      </>
    );
  }

  let itemTarget = '';
  if (item.target) {
    itemTarget = '_blank';
  }
  let navItemClass = ['pc-item'];
  const currentIndex = document.location.pathname
    .toString()
    .split('/')
    .findIndex((id) => id === item.id);
  if (currentIndex > -1) {
    navItemClass = [...navItemClass, 'active'];
  }

  const navLinkClass = ['pc-link'];

  let subContent;
  if (item.external) {
    subContent = (
      <Link to={item.url} target="_blank" rel="noopener noreferrer">
        <NavIcon items={item} />
        {itemTitle}
      </Link>
    );
  } else {
    subContent = (
      <NavLink to={item.url} className={navLinkClass.join(' ')}>
        <NavIcon items={item} />
        {itemTitle}
      </NavLink>
    );
  }
  let mainContent;
  if (windowSize.width < 992) {
    mainContent = (
      <ListGroup.Item as="li" bsPrefix=" " className={navItemClass.join(' ')} onClick={() => dispatch({ type: actionType.COLLAPSE_MENU })}>
        {subContent}
      </ListGroup.Item>
    );
  } else {
    mainContent = (
      <ListGroup.Item as="li" bsPrefix=" " className={navItemClass.join(' ')}>
        {subContent}
      </ListGroup.Item>
    );
  }

  return <>{mainContent}</>;
}

NavItem.propTypes = { item: PropTypes.any };
