import { useEffect, useState } from 'react';
import { specializations } from '../data/specializations.js';

const fallbackDepartments = specializations.map(({ slug, name, description }) => ({
  slug,
  name,
  description,
}));

export default function usePublicDepartments() {
  const [departments, setDepartments] = useState(fallbackDepartments);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/public/departments', { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error?.message || 'Department choices are unavailable.');
        }
        return result;
      })
      .then((result) => {
        setDepartments(result.data);
        setError('');
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError('Using the published department list while the live department list is unavailable.');
        }
      });

    return () => controller.abort();
  }, []);

  return { departments, error };
}
