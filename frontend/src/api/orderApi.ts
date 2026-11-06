export interface OrderItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface CurrentOrder {
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
