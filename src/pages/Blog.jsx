import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import CallToAction from '../components/CallToAction.jsx';
import Reveal from '../components/Reveal.jsx';

const careGuides = [
  {
    category: 'Child Care',
    title: 'Pediatric care through the growing years',
    description:
      'DH Hospitals describes pediatric services for newborns, infants, and adolescents up to 18 years old.',
    image: '/images/index-about.webp',
    alt: 'Child care services at DH Hospitals',
    to: '/child-care',
    link: 'Explore Child Care',
  },
  {
    category: 'Eye Care',
    title: 'Vision screening and eye services',
    description:
      'Learn about the vision screening, cataract surgery, and LASIK services listed by DH Hospitals.',
    image: '/images/vision-screening.webp',
    alt: 'Vision screening service at DH Eye Hospital',
    to: '/eye-care',
    link: 'Explore Eye Care',
  },
  {
    category: 'Dental Care',
    title: 'An overview of dental services',
    description:
      'Explore the general dentistry, dental implants, cosmetic dentistry, and oral surgery services listed by DH Hospitals.',
    image: '/images/general-dentistry.webp',
    alt: 'Dental services at DH Hospitals',
    to: '/dental-care',
    link: 'Explore Dental Care',
  },
];

export default function Blog() {
  return (
    <main>
      <PageIntro
        eyebrow="Health Guides"
        title="Care information from DH Hospitals."
        description="Explore summaries of pediatric, eye-care, and dental services published by the hospital."
        image="/images/index-about-2.webp"
        imageAlt="Healthcare services at DH Hospitals"
      />
      <section className="section blog-section">
        <div className="container">
          <SectionHeading
            eyebrow="Hospital care notes"
            title="Explore our care guides."
            description="These summaries reflect service information from the DH Hospitals website; contact the hospital for individual enquiries."
          />
          <div className="blog-grid">
            {careGuides.map((guide, index) => (
              <Reveal key={guide.title} delay={index * 100}>
                <article className="blog-card">
                  <Link
                    className="blog-image"
                    to={guide.to}
                    aria-label={`${guide.link}: ${guide.title}`}
                  >
                    <img src={guide.image} alt={guide.alt} loading="lazy" decoding="async" />
                  </Link>
                  <div className="blog-card-copy">
                    <span className="blog-category">{guide.category}</span>
                    <h2>{guide.title}</h2>
                    <p>{guide.description}</p>
                    <Link className="text-link" to={guide.to}>
                      {guide.link} <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CallToAction eyebrow="Questions about our services?" />
    </main>
  );
}
