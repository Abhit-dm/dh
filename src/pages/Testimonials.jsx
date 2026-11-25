import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';

export default function Testimonials() {
  return (
    <main>
      <PageIntro
        eyebrow="Testimonials"
        title="Google patient reviews"
        description="Reviews are unavailable until an authorized Google Reviews source is configured."
      />
      <section className="section testimonials-section">
        <div className="container">
          <SectionHeading
            eyebrow="Testimonials"
            title="Google patient reviews"
            description="Only reviews from an authorized Google source will be shown here."
          />
          <div className="testimonial-placeholder" role="status">
            <p>Google Reviews integration is not configured.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
