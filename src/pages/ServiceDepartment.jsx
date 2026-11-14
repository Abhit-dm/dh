import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction.jsx';
import { PageIntro } from '../components/PageIntro.jsx';
import { specializations } from '../data/specializations.js';

export default function ServiceDepartment({ slug }) {
  const department = specializations.find((item) => item.slug === slug);

  if (!department) {
    throw new Error(`Unknown service department: ${slug}`);
  }

  return (
    <main>
      <PageIntro
        eyebrow={department.name}
        title={`${department.name} at DH Hospitals.`}
        description={department.description}
        image={department.image}
        imageAlt={department.imageAlt}
      />
      <section className="section service-department-section">
        <div className="container service-detail-copy service-department-copy">
          <span className="eyebrow">Our Services</span>
          <h2>Learn more about {department.name}.</h2>
          <p>
            Contact DH Hospitals for current information about this department
            and the care available. You can also send an appointment enquiry
            using the department selection below.
          </p>
          <Link
            className="button"
            to={`/appointment?department=${encodeURIComponent(department.name)}`}
          >
            Enquire about {department.name}{' '}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <CallToAction eyebrow={`${department.name} enquiries`} />
    </main>
  );
}
