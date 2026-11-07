export type ProductCategory =
  "STARTERS" | "SALADS" | "TANDOORI" | "MAIN_COURSES" | "DESSERTS" | "DRINKS";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
}

const PRODUCTS_URL = "/api/products";

export async function getMenu(): Promise<Product[]> {
  const response = await fetch(PRODUCTS_URL);
  if (!response.ok) {
    throw new Error(`Menu request failed with status ${response.status}`);
  }
  return (await response.json()) as Product[];
}

// Order in which the categories appear on the restaurant menu (US-01).
export const CATEGORY_ORDER: ProductCategory[] = [
  "STARTERS",
  "SALADS",
  "TANDOORI",
  "MAIN_COURSES",
  "DESSERTS",
  "DRINKS",
];

export const CATEGORY_LABEL: Record<ProductCategory, string> = {
  STARTERS: "Entrantes",
  SALADS: "Ensaladas",
  TANDOORI: "Tandoori",
  MAIN_COURSES: "Platos principales",
  DESSERTS: "Postres",
  DRINKS: "Bebidas",
};

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
}

export async function createProduct(
  request: CreateProductRequest,
): Promise<Product> {
  const response = await fetch(PRODUCTS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Create product failed with status ${response.status}`);
  }
  return (await response.json()) as Product;
}

export async function getProduct(id: number): Promise<Product> {
  const response = await fetch(`${PRODUCTS_URL}/${id}`);
  if (!response.ok) {
    throw new Error(`Product request failed with status ${response.status}`);
  }
  return (await response.json()) as Product;
}

export async function updateProduct(
  id: number,
  request: CreateProductRequest,
): Promise<Product> {
  const response = await fetch(`${PRODUCTS_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Update product failed with status ${response.status}`);
  }
  return (await response.json()) as Product;
}

export async function withdrawProduct(id: number): Promise<void> {
  const response = await fetch(`${PRODUCTS_URL}/${id}/withdrawal`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Withdraw product failed with status ${response.status}`);
  }
}
