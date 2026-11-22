export interface OrderItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// A daily menu of the order (US-12): the dishes chosen and the drink, with its fixed price.
export interface OrderMenu {
  id: number;
  starter: string;
  mainCourse: string;
  dessert: string;
  drink: string;
  price: number;
}

export interface CurrentOrder {
  items: OrderItem[];
  menus: OrderMenu[];
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
  menus: OrderMenu[];
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

export async function addMenuToOrder(
  starterId: number,
  mainCourseId: number,
  dessertId: number,
): Promise<CurrentOrder> {
  const response = await fetch(`${CURRENT_ORDER_URL}/menus`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ starterId, mainCourseId, dessertId }),
  });
  if (!response.ok) {
    throw new Error(`Add menu to order failed with status ${response.status}`);
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

// The dishes of a new daily menu added while modifying a placed order (US-15).
export interface NewOrderMenu {
  starterId: number;
  mainCourseId: number;
  dessertId: number;
}

// The new content of the order: what is not in the request is removed from the order (US-15).
export interface ModifyOrderRequest {
  items: { productId: number; quantity: number }[];
  keptMenuIds: number[];
  newMenus: NewOrderMenu[];
}

// 409: the 10 minutes have passed, 400: the order would be empty, 404: a new product is not in the menu.
export type ModifyOrderError =
  "PERIOD_EXPIRED" | "EMPTY" | "NOT_AVAILABLE" | "UNKNOWN";

export async function getMyOrder(id: number): Promise<PlacedOrder> {
  const response = await fetch(`/api/orders/${id}`);
  if (!response.ok) {
    throw new Error(`Order request failed with status ${response.status}`);
  }
  return (await response.json()) as PlacedOrder;
}

export async function modifyOrder(
  id: number,
  request: ModifyOrderRequest,
): Promise<PlacedOrder> {
  const response = await fetch(`/api/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (response.status === 409) {
    throw new Error("PERIOD_EXPIRED");
  }
  if (response.status === 400) {
    throw new Error("EMPTY");
  }
  if (response.status === 404) {
    throw new Error("NOT_AVAILABLE");
  }
  if (!response.ok) {
    throw new Error("UNKNOWN");
  }
  return (await response.json()) as PlacedOrder;
}
