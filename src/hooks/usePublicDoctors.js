import { useEffect, useState } from 'react';
import { doctors as fallbackDoctors } from '../data/hospital.js';
import { getSpecializationSlug } from '../data/specializations.js';
import { readApiResponse } from '../lib/readApiResponse.js';

export default function usePublicDoctors(department = '') {
  const departmentSlug = getSpecializationSlug(department);
  const [doctors, setDoctors] = useState(() =>
    departmentSlug
      ? fallbackDoctors.filter(
          (doctor) => getSpecializationSlug(doctor.department) === departmentSlug,
        )
      : fallbackDoctors,
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const fallback = departmentSlug
      ? fallbackDoctors.filter(
          (doctor) => getSpecializationSlug(doctor.department) === departmentSlug,
        )
      : fallbackDoctors;
    setDoctors(fallback);
    setError('');
    setIsLoading(true);

    const query = departmentSlug
      ? `?department=${encodeURIComponent(departmentSlug)}`
      : '';
    fetch(`/api/public/doctors${query}`, { signal: controller.signal })
      .then((response) => readApiResponse(response, 'Doctor profiles'))
      .then((result) => {
        if (!Array.isArray(result.data)) {
          throw new Error('The doctor list could not be read.');
        }
        return result.data;
      })
      .then((result) => {
        setDoctors(result);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Doctor profiles are unavailable.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [departmentSlug]);

  return { doctors, error, isLoading };
}
