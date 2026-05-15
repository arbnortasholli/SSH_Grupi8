type HowItWorksCardProps = {
  step: string;
  label: string;
  title: string;
  description: string;
  isLast?: boolean;
};

export const HowItWorksCard: React.FC<HowItWorksCardProps> = ({ step, label, title, description, isLast }) => (
  <article className={isLast ? 'how-card how-card--last' : 'how-card'}>
    <div className="how-card__step">
      <span>{step}</span>
      {!isLast && <i aria-hidden="true" />}
    </div>
    <div className="how-card__body">
      <strong>{label}</strong>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </article>
);
