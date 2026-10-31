import { ArrowUpRight, Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';

const footerLinks = [
  ['About Us', '/about'],
  ['Child Care', '/child-care'],
  ['Eye Care', '/eye-care'],
  ['Dental Care', '/dental-care'],
  ['Our Doctors', '/doctors'],
  ['Gallery', '/gallery'],
  ['Health Guides', '/blog'],
  ['Book Appointment', '/appointment'],
  ['Contact Us', '/contact'],
];

export default function Footer() {
  const { contact, socialLinks, logoUrl } = useHospitalSettings();
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <Link to="/" className="footer-brand" aria-label="DH Hospitals home">
            <img src={logoUrl} alt="DH Hospitals" />
          </Link>
          <p>
            DH Children &amp; Eye Hospitals provides pediatric care, eye care,
            and dental services in Poranki, Vijayawada.
          </p>
          <Link className="footer-social" to="/contact">
            Get in touch <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <div className="footer-social-links" aria-label="Social media">
            {socialLinks.map(({ label, url }) => {
              const Icon = label === 'Facebook' ? Facebook : Instagram;
              return (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`DH Hospitals on ${label}`}
                >
                  <Icon size={17} aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
        <div className="footer-column">
          <h2>Explore</h2>
          {footerLinks.map(([label, to]) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </div>
        <div className="footer-column footer-contact">
          <h2>Contact</h2>
          <a href={`tel:${contact.phoneLink}`}>
            <Phone size={16} aria-hidden="true" /> {contact.phone}
          </a>
          <a href={`mailto:${contact.email}`}>
            <Mail size={16} aria-hidden="true" /> {contact.email}
          </a>
          <p>
            <MapPin size={16} aria-hidden="true" /> {contact.address}
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} DH Hospitals</span>
          <span>Child Care · Eye Care · Dental Care</span>
        </div>
      </div>
    </footer>
  );
}
