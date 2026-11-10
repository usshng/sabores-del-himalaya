export interface OrderItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CurrentOrder {
  items: OrderItem[];
  total: number;
}

export type OrderStatus =
  | "RECEIVED"
  | "IN_PREPARATION"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface PlacedOrder {
  id: number;
  status: OrderStatus;
  placedAt: string;
  total: number;
  items: OrderItem[];
}

const CURRENT_ORDER_URL = "/api/orders/current";

export async function getCurrentOrder(): Promise<CurrentOrder> {
  const response = await fetch(CURRENT_ORDER_URL);
  if (!response.ok) {
    throw new Error(`Order request failed with status ${response.status}`);
  }
  return (await response.json()) as CurrentOrder;
}

export async function addProductToOrder(
  productId: number,
  quantity: number,
): Promise<CurrentOrder> {
  const response = await fetch(`${CURRENT_ORDER_URL}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!response.ok) {
    throw new Error(`Add to order failed with status ${response.status}`);
  }
  return (await response.json()) as CurrentOrder;
}

export async function confirmOrder(): Promise<PlacedOrder> {
  const response = await fetch(`${CURRENT_ORDER_URL}/confirmation`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Confirm order failed with status ${response.status}`);
  }
  return (await response.json()) as PlacedOrder;
}

export interface MyOrder {
  id: number;
  placedAt: string;
  total: number;
  status: OrderStatus;
}

export async function getMyOrders(): Promise<MyOrder[]> {
  const response = await fetch("/api/orders");
  if (!response.ok) {
    throw new Error(`My orders request failed with status ${response.status}`);
  }
  return (await response.json()) as MyOrder[];
}

export const CANCELLATION_PERIOD_MS = 10 * 60 * 1000;

export async function cancelOrder(id: number): Promise<MyOrder> {
  const response = await fetch(`/api/orders/${id}/cancellation`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Cancel order failed with status ${response.status}`);
  }
  return (await response.json()) as MyOrder;
}
