import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function PageIntro({ eyebrow, title, description, image, imageAlt }) {
  return (
    <section className={`page-intro${image ? ' page-intro-with-image' : ''}`}>
      <div className="container page-intro-inner">
        <div className="page-intro-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
          <div className="breadcrumb">
            <Link to="/">Home</Link>
            <ArrowRight size={14} aria-hidden="true" />
            <span>{eyebrow}</span>
          </div>
        </div>
        {image && (
          <div className="page-intro-image">
            <img src={image} alt={imageAlt || ''} decoding="async" />
          </div>
        )}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  return (
    <div className={`section-heading section-heading-${align}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
