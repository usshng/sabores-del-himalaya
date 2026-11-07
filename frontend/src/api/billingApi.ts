export interface DailyBilling {
  date: string;
  orderCount: number;
  total: number;
}

export async function getDailyBilling(date: string): Promise<DailyBilling> {
  const response = await fetch(
    `/api/billing/daily?date=${encodeURIComponent(date)}`,
  );
  if (!response.ok) {
    throw new Error(`Billing request failed with status ${response.status}`);
  }
  return (await response.json()) as DailyBilling;
}
