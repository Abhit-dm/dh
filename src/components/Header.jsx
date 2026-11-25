import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Mail, Menu, Phone, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import useHospitalSettings from '../hooks/useHospitalSettings.jsx';
import { specializations } from '../data/specializations.js';

const navigation = [
  { label: 'Home', to: '/', end: true },
  { label: 'About Us', to: '/about' },
  { label: 'Child Care', to: '/child-care' },
  { label: 'Eye Care', to: '/eye-care' },
  { label: 'Dental Care', to: '/dental-care' },
  { label: 'Family Healthcare', to: '/family-healthcare' },
  { label: 'Testimonials', to: '/testimonials' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const menuToggleRef = useRef(null);
  const servicesMenuRef = useRef(null);
  const servicesToggleRef = useRef(null);
  const location = useLocation();
  const { contact, logoUrl } = useHospitalSettings();
  const isServiceRoute = specializations.some(({ to }) => to === location.pathname);
  const hasDedicatedNavigationLink = navigation.some(
    ({ to }) => to === location.pathname,
  );
  const servicesActive = isServiceRoute && !hasDedicatedNavigationLink;

  useEffect(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!servicesOpen) return undefined;
    function closeOnOutsidePointer(event) {
      if (!servicesMenuRef.current?.contains(event.target)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [servicesOpen]);

  useEffect(() => {
    if (!menuOpen && !servicesOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      setServicesOpen(false);
      (servicesOpen ? servicesToggleRef : menuToggleRef).current?.focus();
    }
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen, servicesOpen]);

  return (
    <>
      <div className="contact-bar">
        <div className="container contact-bar-inner">
          {contact.phoneNumbers.map(({ number, phoneLink }) => (
            <a key={phoneLink} href={`tel:${phoneLink}`}>
              <Phone size={14} aria-hidden="true" /> {number}
            </a>
          ))}
          <a className="contact-bar-email" href={`mailto:${contact.email}`}>
            <Mail size={14} aria-hidden="true" /> {contact.email}
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
            onClick={() => {
              setMenuOpen((open) => !open);
              setServicesOpen(false);
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <nav
            id="primary-navigation"
            className={`primary-navigation${menuOpen ? ' is-open' : ''}`}
            aria-label="Main navigation"
          >
            <div className="nav-links">
              {navigation.map(({ label, to, end, services }) =>
                services ? (
                  <div
                    key={label}
                    ref={servicesMenuRef}
                    className={`nav-service-menu${servicesOpen ? ' is-open' : ''}`}
                    onPointerEnter={(event) => {
                      if (
                        event.pointerType === 'mouse' &&
                        !window.matchMedia('(max-width: 1100px)').matches
                      ) {
                        setServicesOpen(true);
                      }
                    }}
                    onPointerLeave={(event) => {
                      if (
                        event.pointerType === 'mouse' &&
                        !window.matchMedia('(max-width: 1100px)').matches
                      ) {
                        setServicesOpen(false);
                      }
                    }}
                    onFocus={() => {
                      if (!window.matchMedia('(max-width: 1100px)').matches) {
                        setServicesOpen(true);
                      }
                    }}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget)) {
                        setServicesOpen(false);
                      }
                    }}
                  >
                    <button
                      ref={servicesToggleRef}
                      className={`nav-link nav-services-trigger${servicesActive ? ' is-active' : ''}`}
                      type="button"
                      aria-expanded={servicesOpen}
                      aria-controls="services-dropdown"
                      onClick={() =>
                        setServicesOpen((open) =>
                          window.matchMedia('(max-width: 1100px)').matches
                            ? !open
                            : true,
                        )
                      }
                    >
                      Our Services <ChevronDown size={14} aria-hidden="true" />
                    </button>
                    <div className="nav-service-dropdown" id="services-dropdown">
                      {specializations.map(({ slug, name, to }) => (
                        <Link
                          key={slug}
                          to={to}
                          className="nav-link"
                          aria-current={location.pathname === to ? 'page' : undefined}
                          onClick={() => {
                            setServicesOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          {name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={label}
                    to={to}
                    end={end}
                    className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
                  >
                    {label}
                  </NavLink>
                ),
              )}
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
