type EmptyStateProps = {
  title: string;
  description: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => (
  <div className="empty-state">
    <div className="empty-state__mark">AK</div>
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);
