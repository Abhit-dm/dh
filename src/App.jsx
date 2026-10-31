import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import FloatingActions from './components/FloatingActions.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import ChildCare from './pages/ChildCare.jsx';
import EyeCare from './pages/EyeCare.jsx';
import DentalCare from './pages/DentalCare.jsx';
import Doctors from './pages/Doctors.jsx';
import Gallery from './pages/Gallery.jsx';
import Contact from './pages/Contact.jsx';
import Blog from './pages/Blog.jsx';
import Appointment from './pages/Appointment.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

const pageDetails = {
  '/': {
    title: 'DH Hospitals | Child, Eye & Dental Care',
    description:
      'DH Children & Eye Hospitals provides pediatric care, eye care and dental services in Poranki, Vijayawada.',
  },
  '/about': {
    title: 'About Us | DH Hospitals',
    description: 'Learn about DH Children & Eye Hospitals and its published services.',
  },
  '/child-care': {
    title: 'Child Care | DH Hospitals',
    description:
      'Explore pediatric care for newborns, infants and adolescents at DH Children & Eye Hospitals.',
  },
  '/eye-care': {
    title: 'Eye Care | DH Hospitals',
    description: 'Explore eye care, cataract and glaucoma surgery, LASIK and consultations.',
  },
  '/dental-care': {
    title: 'Dental Care | DH Hospitals',
    description: 'Explore dental services listed by DH Hospitals.',
  },
  '/doctors': {
    title: 'Our Doctors | DH Hospitals',
    description: 'Meet the doctors listed by DH Hospitals.',
  },
  '/gallery': {
    title: 'Gallery | DH Hospitals',
    description: 'View DH Hospitals and service photographs.',
  },
  '/contact': {
    title: 'Contact Us | DH Hospitals',
    description: 'Contact DH Hospitals in Poranki, Vijayawada.',
  },
  '/blog': {
    title: 'Health Guides | DH Hospitals',
    description:
      'Explore pediatric, eye-care and dental service information from DH Hospitals.',
  },
  '/appointment': {
    title: 'Appointment Enquiry | DH Hospitals',
    description:
      'Send an appointment enquiry to DH Hospitals. Submission does not confirm a booking.',
  },
  '/admin': {
    title: 'Administrator | DH Hospitals',
    description: 'Secure DH Hospitals website and appointment management.',
  },
  '/admin/login': {
    title: 'Administrator Login | DH Hospitals',
    description: 'Secure sign in for authorized DH Hospitals administrators.',
  },
};

function PageEffects() {
  const location = useLocation();

  useEffect(() => {
    const pagePath = location.pathname.replace(/\/+$/, '') || '/';
    const details = pageDetails[pagePath] || pageDetails['/'];
    const canonicalUrl = `https://dhhospitals.com${pagePath === '/' ? '/' : pagePath}`;
    document.title = details.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute('content', details.description);

    const upsertMeta = (selector, attributes) => {
      let element = document.head.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        document.head.append(element);
      }
      for (const [name, value] of Object.entries(attributes)) {
        element.setAttribute(name, value);
      }
    };

    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: details.title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: details.description,
    });
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: 'website',
    });
    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: 'DH Hospitals',
    });
    upsertMeta('meta[property="og:image"]', {
      property: 'og:image',
      content: 'https://dhhospitals.com/images/hospital-cover.webp',
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: pagePath.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow',
    });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;

    let structuredData = document.getElementById('hospital-structured-data');
    if (pagePath.startsWith('/admin')) {
      structuredData?.remove();
    } else {
      if (!structuredData) {
        structuredData = document.createElement('script');
        structuredData.id = 'hospital-structured-data';
        structuredData.type = 'application/ld+json';
        document.head.append(structuredData);
      }
      structuredData.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Hospital',
        name: 'DH Children & Eye Hospitals',
        alternateName: 'DH Hospitals',
        url: 'https://dhhospitals.com/',
        image: 'https://dhhospitals.com/images/hospital-cover.webp',
        telephone: '+91 866 258 1123',
        email: 'contact@dhhospitals.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'DH hospitals Road, Behind Chepalakundi, Penamaluru Center',
          addressLocality: 'Poranki, Vijayawada',
          postalCode: '521137',
          addressCountry: 'IN',
        },
        sameAs: [
          'https://www.facebook.com/Dhclinic28',
          'https://www.instagram.com/dhhospitals/',
        ],
      });
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion && 'IntersectionObserver' in window) {
      const sections = document.querySelectorAll(
        '.page-transition main > section:not(.hero)',
      );
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('scroll-revealed');
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -24px 0px' },
      );
      sections.forEach((section) => observer.observe(section));

      const route = document.querySelector('.page-transition');
      const revealFocusedSection = (event) => {
        const section = event.target.closest('main > section');
        section?.classList.add('scroll-revealed');
      };
      route?.addEventListener('focusin', revealFocusedSection);

      if (location.hash) {
        requestAnimationFrame(() => {
          document
            .querySelector(location.hash)
            ?.scrollIntoView({ behavior: 'smooth' });
        });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      return () => {
        observer.disconnect();
        route?.removeEventListener('focusin', revealFocusedSection);
      };
    }

    if (location.hash) {
      requestAnimationFrame(() => {
        document
          .querySelector(location.hash)
          ?.scrollIntoView({ behavior: 'auto' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.hash]);

  return null;
}

export default function App() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <PageEffects />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      {!isAdmin && <Header />}
      {!isAdmin && <FloatingActions />}
      <div
        key={location.pathname}
        id="main-content"
        className={`page-transition${isAdmin ? ' admin-route-transition' : ''}`}
        tabIndex="-1"
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/child-care" element={<ChildCare />} />
          <Route path="/eye-care" element={<EyeCare />} />
          <Route path="/dental-care" element={<DentalCare />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      {!isAdmin && <Footer />}
    </>
  );
}
