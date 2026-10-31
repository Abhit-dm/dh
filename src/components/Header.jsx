import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Mail, Menu, Phone, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';

const navigation = [
  { label: 'Home', to: '/', end: true },
  { label: 'About Us', to: '/about' },
  { label: 'Child Care', to: '/child-care' },
  { label: 'Eye Care', to: '/eye-care' },
  { label: 'Dental Care', to: '/dental-care' },
  { label: 'Our Doctors', to: '/doctors' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Health Guides', to: '/blog' },
  { label: 'Contact Us', to: '/contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const location = useLocation();
  const { contact, logoUrl } = useHospitalSettings();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuToggleRef.current?.focus();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      <div className="contact-bar">
        <div className="container contact-bar-inner">
          <a href={`tel:${contact.phoneLink}`}>
            <Phone size={14} aria-hidden="true" /> {contact.phone}
          </a>
          <a className="contact-bar-email" href={`mailto:${contact.email}`}>
            <Mail size={14} aria-hidden="true" /> {contact.email}
          </a>
          <a className="contact-bar-emergency" href={`tel:${contact.emergency.replace(/[^\d+]/g, '')}`}>
            Emergency line <strong>{contact.emergency}</strong>
          </a>
        </div>
      </div>
      <header className="site-header">
        <div className="header-inner container">
          <Link className="brand-link" to="/" aria-label="DH Hospitals home">
            <img
              className="brand-logo"
              src={logoUrl}
              alt="DH Hospitals"
            />
          </Link>
          <button
            ref={menuToggleRef}
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav
            id="primary-navigation"
            className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
            aria-label="Main navigation"
          >
            <div className="nav-links">
              {navigation.map(({ label, to, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `nav-link${isActive ? ' is-active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
            <Link className="button button-small header-appointment" to="/appointment">
              Book Appointment <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
