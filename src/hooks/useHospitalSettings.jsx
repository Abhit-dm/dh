import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { contact as verifiedContact, socialLinks as verifiedSocialLinks } from '../data/hospital.js';

const HospitalSettingsContext = createContext(null);

function settingString(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function safeImageUrl(value, fallback) {
  if (typeof value !== 'string') return fallback;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  try {
    return new URL(value).protocol === 'https:' ? value : fallback;
  } catch {
    return fallback;
  }
}

function publicSocialLinks(value) {
  if (!Array.isArray(value)) return verifiedSocialLinks;
  const links = value.flatMap((item) => {
    if (!item || typeof item !== 'object' || typeof item.label !== 'string' || typeof item.url !== 'string') {
      return [];
    }
    try {
      return new URL(item.url).protocol === 'https:'
        ? [{ label: item.label.slice(0, 40), url: item.url }]
        : [];
    } catch {
      return [];
    }
  });
  return links;
}

export function HospitalSettingsProvider({ children }) {
  const [values, setValues] = useState({});

  useEffect(() => {
    let active = true;
    fetch('/api/public/website-settings')
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json();
        if (active && Array.isArray(result.data)) {
          setValues(Object.fromEntries(result.data.map((setting) => [setting.key, setting.value])));
        }
      })
      .catch(() => {
        // The published information below remains the fallback when the API is unavailable.
      });
    return () => { active = false; };
  }, []);

  const settings = useMemo(() => {
    const phone = settingString(values['contact.phone'], verifiedContact.phone);
    const emergency = settingString(values['contact.emergency'], verifiedContact.emergency);
    const email = settingString(values['contact.email'], verifiedContact.email);
    const hoursValue = values['contact.hours'];
    const hours = Array.isArray(hoursValue) && hoursValue.every(
      (item) => item && typeof item.days === 'string' && typeof item.time === 'string',
    ) ? hoursValue : verifiedContact.hours;
    return {
      contact: {
        address: settingString(values['contact.address'], verifiedContact.address),
        phone,
        phoneLink: phone.replace(/[^\d+]/g, ''),
        landline: settingString(values['contact.landline'], verifiedContact.landline),
        emergency,
        email,
        hours,
      },
      logoUrl: safeImageUrl(values['branding.logo'], '/images/dh-hospitals-logo.png'),
      socialLinks: publicSocialLinks(values['social.links']),
      homepage: {
        heroTitle: settingString(values['homepage.heroTitle'], "Caring for Every Child's Health and Vision."),
        heroDescription: settingString(
          values['homepage.heroDescription'],
          'Comprehensive pediatric care, eye care, and dental services in Poranki, Vijayawada.',
        ),
      },
    };
  }, [values]);

  return (
    <HospitalSettingsContext.Provider value={settings}>
      {children}
    </HospitalSettingsContext.Provider>
  );
}

export default function useHospitalSettings() {
  return useContext(HospitalSettingsContext) ?? {
    contact: verifiedContact,
    logoUrl: '/images/dh-hospitals-logo.png',
    socialLinks: verifiedSocialLinks,
    homepage: {
      heroTitle: "Caring for Every Child's Health and Vision.",
      heroDescription: 'Comprehensive pediatric care, eye care, and dental services in Poranki, Vijayawada.',
    },
  };
}
