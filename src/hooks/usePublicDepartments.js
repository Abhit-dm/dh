import { useEffect, useState } from 'react';

const fallbackDepartments = [
  { slug: 'child-care', name: 'Child Care' },
  { slug: 'eye-care', name: 'Eye Care' },
  { slug: 'dental-care', name: 'Dental Care' },
];

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
