export type ComponentStatus = "UP" | "DOWN";

export interface Health {
  backend: ComponentStatus;
  database: ComponentStatus;
}

const HEALTH_URL = "/api/health";
const HTTP_SERVICE_UNAVAILABLE = 503;

export async function getHealth(): Promise<Health> {
  const response = await fetch(HEALTH_URL);
  // The backend answers 503 with the same body when the database is down, so that body is still valid data.
  if (!response.ok && response.status !== HTTP_SERVICE_UNAVAILABLE) {
    throw new Error(`Health check failed with status ${response.status}`);
  }
  return (await response.json()) as Health;
}
