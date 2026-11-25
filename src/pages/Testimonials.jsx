import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';

const testimonials = [
  {
    category: 'Pediatrics',
    quote: 'Dr. Dinesh explains every condition and treatment clearly. We always feel reassured after every visit.',
  },
  {
    category: 'Eye Care',
    quote: "Dr. Haasitha's expertise and caring approach made cataract surgery smooth and successful.",
  },
  {
    category: 'Dental Care',
    quote: 'Dr. Sai Harshitha made my child comfortable throughout treatment.',
  },
  {
    category: 'Hospital Services',
    quote: 'Clean hospital, caring staff, and a welcoming family-friendly environment.',
  },
];

export default function Testimonials() {
  return (
    <main>
      <PageIntro
        eyebrow="Testimonials"
        title="Patient feedback"
        description="Experiences shared across care at DH Hospitals."
      />
      <section className="section testimonials-section">
        <div className="container">
          <SectionHeading
            eyebrow="Patient stories"
            title="What patients and families say."
          />
          <div className="testimonial-grid">
            {testimonials.map(({ category, quote }) => (
              <article className="testimonial-placeholder" key={category}>
                <p>“{quote}”</p>
                <span>{category}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
