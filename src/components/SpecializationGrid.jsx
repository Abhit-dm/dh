import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { specializations } from '../data/specializations.js';
import { SectionHeading } from './PageIntro.jsx';

export default function SpecializationGrid({
  id = 'specializations',
  eyebrow = 'Our Services',
  title = 'Care for every member of your family.',
  description = 'Explore the departments at DH Hospitals.',
}) {
  return (
    <section className="section specialization-section" id={id}>
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="specialization-grid">
          {specializations.map(({
            slug,
            name,
            description: summary,
            icon: Icon,
            image,
            imageAlt,
            to,
          }, index) => (
            <article className="specialization-card" key={slug}>
              <img
                className="specialization-image"
                src={image}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
              />
              <div className="specialization-card-content">
                <div className="specialization-card-top">
                  <span className="specialization-icon">
                    <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
                  </span>
                  <span className="specialization-number">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h3>{name}</h3>
                <p>{summary}</p>
                <Link className="text-link" to={to}>
                  Learn more <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
