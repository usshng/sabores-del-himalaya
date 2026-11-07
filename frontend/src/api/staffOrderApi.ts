import type { OrderItem, OrderStatus } from "@/api/orderApi";

export interface ReceivedOrder {
  id: number;
  customerName: string;
  customerAddress: string;
  placedAt: string;
  status: OrderStatus;
}

export interface ReceivedOrderDetail extends ReceivedOrder {
  items: OrderItem[];
  total: number;
}

const STAFF_ORDERS_URL = "/api/staff/orders";

export async function getReceivedOrders(): Promise<ReceivedOrder[]> {
  const response = await fetch(STAFF_ORDERS_URL);
  if (!response.ok) {
    throw new Error(`Orders request failed with status ${response.status}`);
  }
  return (await response.json()) as ReceivedOrder[];
}

export async function getReceivedOrder(
  id: number,
): Promise<ReceivedOrderDetail> {
  const response = await fetch(`${STAFF_ORDERS_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Order request failed with status ${response.status}`);
  }
  return (await response.json()) as ReceivedOrderDetail;
}

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<ReceivedOrderDetail> {
  const response = await fetch(`${STAFF_ORDERS_URL}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    throw new Error(`Status update failed with status ${response.status}`);
  }
  return (await response.json()) as ReceivedOrderDetail;
}
