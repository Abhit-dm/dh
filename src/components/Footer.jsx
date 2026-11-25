import { ArrowUpRight, Facebook, Instagram, MapPin, Phone, Mail, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';

const exploreLinks = [
  ['Gallery', '/gallery'],
  ['Health Guides', '/blog'],
  ['Our Blog', '/blog'],
  ['Book Appointment', '/appointment'],
];

export default function Footer() {
  const { contact, socialLinks, logoUrl, maintainerUrl } = useHospitalSettings();
  const hasYoutubeLink = socialLinks.some(
    ({ label }) => label.trim().toLowerCase() === 'youtube',
  );
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-about">
          <Link to="/" className="footer-brand" aria-label="DH Hospitals home">
            <img src={logoUrl} alt="DH Hospitals" />
          </Link>
          <p>
            DH Hospitals shares pediatric care, eye care,
            and dental services in Poranki, Vijayawada.
          </p>
          <Link className="footer-social" to="/contact">
            Get in touch <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
          <div className="footer-social-links" aria-label="Social media">
            {socialLinks.map(({ label, url }) => {
              const normalizedLabel = label.trim().toLowerCase();
              const Icon = normalizedLabel === 'facebook'
                ? Facebook
                : normalizedLabel === 'youtube'
                  ? Youtube
                  : Instagram;
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
            {!hasYoutubeLink && (
              <span
                title="YouTube channel URL needs to be configured"
                aria-label="YouTube channel URL needs to be configured"
              >
                <Youtube size={17} aria-hidden="true" />
              </span>
            )}
          </div>
        </div>
        <div className="footer-column">
          <h2>Explore</h2>
          {exploreLinks.map(([label, to]) => (
            <Link key={label} to={to}>
              {label}
            </Link>
          ))}
        </div>
        <div className="footer-column footer-contact">
          <h2>Contact</h2>
          {contact.phoneNumbers.map(({ number, phoneLink }) => (
            <a key={phoneLink} href={`tel:${phoneLink}`}>
              <Phone size={16} aria-hidden="true" /> {number}
            </a>
          ))}
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
          <div className="footer-attribution">
            <span>© {new Date().getFullYear()} DH Hospitals. All Rights Reserved.</span>
            <span>
              Maintained by{' '}
              {maintainerUrl ? (
                <a href={maintainerUrl} target="_blank" rel="noopener noreferrer">Abhit.in</a>
              ) : (
                'Abhit.in'
              )}
            </span>
          </div>
          <span>Child Care · Eye Care · Dental</span>
        </div>
      </div>
    </footer>
  );
}
