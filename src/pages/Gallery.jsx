import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryImages } from '../data/hospital.js';
import { PageIntro, SectionHeading } from '../components/PageIntro.jsx';
import CallToAction from '../components/CallToAction.jsx';

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null);
  const lightboxRef = useRef(null);
  const closeButtonRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (activeIndex === null) {
      openerRef.current?.focus();
      return undefined;
    }

    closeButtonRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight') {
        setActiveIndex((index) => (index + 1) % galleryImages.length);
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
      }
      if (event.key === 'Tab') {
        const buttons = lightboxRef.current?.querySelectorAll('button:not([disabled])');
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeIndex]);

  return (
    <>
      <main>
        <PageIntro
          eyebrow="Gallery"
          title="A closer look at DH Hospitals."
          description="Hospital and service photographs from the DH Hospitals website."
          image="/images/hospital-cover.webp"
          imageAlt="DH Hospitals"
        />
        <section className="section gallery-section">
          <div className="container">
            <SectionHeading
              eyebrow="DH Hospitals"
              title="Our gallery."
              description="Select an image to view it larger."
            />
            <div className="gallery-grid">
              {galleryImages.map((image, index) => (
                <button
                  className="gallery-item"
                  key={image.src}
                  type="button"
                  onClick={(event) => {
                    openerRef.current = event.currentTarget;
                    setActiveIndex(index);
                  }}
                  aria-label={`View ${image.caption}`}
                >
                  <img src={image.src} alt={image.alt} loading="lazy" />
                  <span className="gallery-caption">{image.caption}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
        {activeIndex !== null && (
          <div
            className="lightbox"
            ref={lightboxRef}
            role="dialog"
            aria-modal="true"
            aria-label={galleryImages[activeIndex].caption}
            onClick={() => setActiveIndex(null)}
          >
            <button
              className="lightbox-close"
              ref={closeButtonRef}
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Close image preview"
            >
              <X />
            </button>
            <button
              className="lightbox-prev"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft />
            </button>
            <figure onClick={(event) => event.stopPropagation()}>
              <img src={galleryImages[activeIndex].src} alt={galleryImages[activeIndex].alt} decoding="async" />
              <figcaption>{galleryImages[activeIndex].caption}</figcaption>
            </figure>
            <button
              className="lightbox-next"
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setActiveIndex((index) => (index + 1) % galleryImages.length);
              }}
              aria-label="Next image"
            >
              <ChevronRight />
            </button>
          </div>
        )}
        <CallToAction />
      </main>
    </>
  );
}
