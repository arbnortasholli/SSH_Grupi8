import type { Brand } from '../../data/brandsDummyData';
import { Link } from 'react-router-dom';

type BrandCardProps = {
  brand: Brand;
};

export const BrandCard: React.FC<BrandCardProps> = ({ brand }) => (
  <Link
    className="brand-card"
    to={`/buy?brand=${brand.slug}`}
    aria-label={`Browse ${brand.name} cars`}
    style={{ '--brand-accent': brand.accent } as React.CSSProperties}
  >
    <div className="brand-card__top">
      <span className="brand-card__logo">
        <img src={brand.logoUrl} alt={`${brand.name} logo`} loading="lazy" />
      </span>
      <span className="brand-card__count">{brand.count} listings</span>
    </div>
    <div className="brand-card__content">
      <h3>{brand.name}</h3>
      <p>{brand.popularModel} is the most searched model</p>
    </div>
    <dl className="brand-card__meta">
      <div>
        <dt>Avg. price</dt>
        <dd>{brand.averagePrice}</dd>
      </div>
      <div>
        <dt>Top city</dt>
        <dd>{brand.topCity}</dd>
      </div>
    </dl>
    <span className="brand-card__cta">Browse brand</span>
  </Link>
);
