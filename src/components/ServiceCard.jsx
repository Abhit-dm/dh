import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ title, description, image, to }) {
  return (
    <article className="service-card">
      <Link to={to} className="service-image-link" aria-label={`Explore ${title}`}>
        <img src={image} alt="" loading="lazy" decoding="async" />
        <span className="service-image-arrow">
          <ArrowUpRight size={19} aria-hidden="true" />
        </span>
      </Link>
      <div className="service-card-copy">
        <h3>{title}</h3>
        <p>{description}</p>
        <Link className="text-link" to={to}>
          Explore more <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
