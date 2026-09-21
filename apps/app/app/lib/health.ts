import { HealthResponseSchema, type HealthResponse } from "@template-customware/shared";

export async function fetchHealth(signal: AbortSignal): Promise<HealthResponse> {
  const response = await fetch("/health", { signal });
  if (!response.ok) {
    throw new Error(`Health request failed with status ${response.status}.`);
  }

  const payload: unknown = await response.json();
  return HealthResponseSchema.parse(payload);
}
