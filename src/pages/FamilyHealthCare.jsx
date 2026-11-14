import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction.jsx';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';

const careStages = [
  {
    title: 'Newborn and child health',
    description:
      'DH Hospitals describes pediatric care for newborns, infants, and adolescents up to 18 years old, including skin care, nebulization, and diet-feeding counseling.',
    link: '/child-care',
    linkText: 'Explore Child Care',
  },
  {
    title: 'Adult health',
    description:
      'General Medicine, Eye Care, and Dental Care are among the departments listed by the hospital. Contact DH Hospitals to confirm the services available for your needs.',
    link: '/general-medicine',
    linkText: 'Explore General Medicine',
  },
  {
    title: 'Women’s health',
    description:
      'The hospital lists an Obstetrics & Gynecology department. Contact the hospital for current department information and appointment enquiries.',
    link: '/obstetrics-gynecology',
    linkText: 'Explore Obstetrics & Gynecology',
  },
  {
    title: 'Older adult health',
    description:
      'The public service information does not list a dedicated geriatric department. Please contact DH Hospitals to confirm which services can support older adults.',
    link: '/contact',
    linkText: 'Contact DH Hospitals',
  },
];

export default function FamilyHealthCare() {
  return (
    <main>
      <PageIntro
        eyebrow="Family Health Care"
        title="Care information for every stage of life."
        description="Explore the services DH Hospitals publishes for children, adults, and women, and contact the hospital to confirm care for your family’s needs."
        image="/images/family-healthcare.jpg"
        imageAlt="A clinician consulting with a family."
      />
      <section className="section family-healthcare-section">
        <div className="container">
          <SectionHeading
            eyebrow="Family health"
            title="Services for the people you care about."
            description="Published department information includes pediatric care through age 18, General Medicine, Eye Care, Dental Care, and Obstetrics & Gynecology."
          />
          <div className="family-care-grid">
            {careStages.map(({ title, description, link, linkText }, index) => (
              <article className="family-care-card" key={title}>
                <span className="family-care-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
                <Link className="text-link" to={link}>{linkText}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CallToAction eyebrow="Family health enquiries" />
    </main>
  );
}
