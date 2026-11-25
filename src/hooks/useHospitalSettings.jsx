import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { contact as verifiedContact, socialLinks as verifiedSocialLinks } from '../data/hospital.js';

const HospitalSettingsContext = createContext(null);
const fallbackMaintainerUrl = 'https://abhit.in';

function getPhoneNumbers(primary) {
  if (typeof primary !== 'string') return [];
  const phoneLink = primary.replace(/[^\d+]/g, '');
  if (!/^\+?\d{7,15}$/.test(phoneLink)) return [];
  return [{ number: primary, phoneLink }];
}

const fallbackContact = {
  ...verifiedContact,
  phoneLink: verifiedContact.phone.replace(/[^\d+]/g, ''),
  phoneNumbers: getPhoneNumbers(verifiedContact.phone),
};

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

function safeExternalUrl(value) {
  if (typeof value !== 'string') return '';
  try {
    return new URL(value).protocol === 'https:' ? value : '';
  } catch {
    return '';
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
    const configuredPhoneNumbers = getPhoneNumbers(phone);
    const phoneNumbers = configuredPhoneNumbers.length
      ? configuredPhoneNumbers
      : fallbackContact.phoneNumbers;
    const primaryPhone = phoneNumbers[0];
    const email = settingString(values['contact.email'], verifiedContact.email);
    const hoursValue = values['contact.hours'];
    const hours = Array.isArray(hoursValue) && hoursValue.every(
      (item) => item && typeof item.days === 'string' && typeof item.time === 'string',
    ) ? hoursValue : verifiedContact.hours;
    return {
      contact: {
        address: settingString(values['contact.address'], verifiedContact.address),
        phone: primaryPhone.number,
        phoneLink: primaryPhone.phoneLink,
        phoneNumbers,
        email,
        hours,
      },
      logoUrl: safeImageUrl(values['branding.logo'], '/images/dh-hospitals-logo.png'),
      maintainerUrl: safeExternalUrl(values['branding.maintainerUrl']) || fallbackMaintainerUrl,
      socialLinks: publicSocialLinks(values['social.links']),
      homepage: {
        heroTitle: settingString(values['homepage.heroTitle'], 'DH Hospitals – Best Treatment at Affordable Pricing'),
        heroDescription: settingString(
          values['homepage.heroDescription'],
          "Your Family's Trusted Healthcare Partner in Vijayawada",
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
    contact: fallbackContact,
    logoUrl: '/images/dh-hospitals-logo.png',
    maintainerUrl: fallbackMaintainerUrl,
    socialLinks: verifiedSocialLinks,
    homepage: {
      heroTitle: 'DH Hospitals – Best Treatment at Affordable Pricing',
      heroDescription: "Your Family's Trusted Healthcare Partner in Vijayawada",
    },
  };
}
