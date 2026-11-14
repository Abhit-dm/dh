import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';

export default function Testimonials() {
  return (
    <main>
      <PageIntro
        eyebrow="Testimonials"
        title="Patient feedback"
        description="Patient feedback will be shared here after it has been approved for publication."
      />
      <section className="section testimonials-section">
        <div className="container">
          <SectionHeading
            eyebrow="Testimonials"
            title="Patient experiences"
            description="No approved patient testimonials are currently available."
          />
          <article className="testimonial-placeholder">
            <span className="eyebrow">Sample placeholder — not a real patient review</span>
            <p>
              “Approved patient feedback can be added here when it is available.”
            </p>
            <span>Replace this sample with approved patient feedback.</span>
          </article>
        </div>
      </section>
    </main>
  );
}
