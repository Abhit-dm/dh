export async function readApiResponse(response, resourceName) {
  const body = await response.text();
  const routeHint = 'Check that /api/* requests are routed to the API service.';

  if (!body.trim()) {
    throw new Error(
      `${resourceName} returned an empty response (HTTP ${response.status}). ${routeHint}`,
    );
  }

  let result;
  try {
    result = JSON.parse(body);
  } catch {
    throw new Error(
      `${resourceName} returned a non-JSON response (HTTP ${response.status}). ${routeHint}`,
    );
  }

  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error(
      `${resourceName} returned an invalid response (HTTP ${response.status}). ${routeHint}`,
    );
  }

  if (!response.ok) {
    throw new Error(
      result.error?.message || `${resourceName} request failed (HTTP ${response.status}).`,
    );
  }

  return result;
}
