// @ts-nocheck
import { Card, Col, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

const summaryCards = [
  {
    title: 'Permissions',
    value: 'Ready',
    description: 'Create permissions from the sidebar action.',
    icon: 'shield'
  },
  {
    title: 'Admin Area',
    value: 'Active',
    description: 'AutoKosova CMS is prepared for backend modules.',
    icon: 'grid'
  },
  {
    title: 'Database',
    value: 'API',
    description: 'Permission creation will use your backend endpoint.',
    icon: 'database'
  }
];

export default function AdminDashboard() {
  return (
    <div className="ak-admin-page">
      <div className="ak-admin-hero">
        <div>
          <span className="ak-admin-eyebrow">AutoKosova Admin</span>
          <h2>Dashboard</h2>
          <p>Use the sidebar to manage admin actions. Start by adding permissions for your role system.</p>
        </div>
        <div className="ak-admin-hero-icon">
          <FeatherIcon icon="home" size={28} />
        </div>
      </div>

      <Row>
        {summaryCards.map((card) => (
          <Col key={card.title} md={6} xl={4}>
            <Card className="ak-admin-card ak-dashboard-card">
              <Card.Body>
                <div className="ak-dashboard-card__icon">
                  <FeatherIcon icon={card.icon} size={22} />
                </div>
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <p>{card.description}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
