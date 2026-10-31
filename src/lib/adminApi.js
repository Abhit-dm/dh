export async function readAdminResponse(response) {
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }
  if (!response.ok) {
    throw new Error(result.error?.message || 'The request could not be completed.');
  }
  return result;
}

export async function adminRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  return readAdminResponse(
    await fetch(path, {
      credentials: 'same-origin',
      ...options,
      headers,
    }),
  );
}
