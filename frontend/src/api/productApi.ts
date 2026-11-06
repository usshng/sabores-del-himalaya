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
