// Use of a dish only for daily menus (US-06), the same values as MenuUse in the backend.
export type MenuUse = "STARTER" | "MAIN_COURSE" | "DESSERT";

export const MENU_USE_LABEL: Record<MenuUse, string> = {
  STARTER: "Entrante",
  MAIN_COURSE: "Plato principal",
  DESSERT: "Postre",
};

export interface CreateMenuDishRequest {
  name: string;
  description: string;
  menuUse: MenuUse;
}

export interface MenuDish {
  id: number;
  name: string;
  description: string;
}

// Registers a dish only for daily menus (US-06). Only the chef can call it.
export async function createMenuDish(
  request: CreateMenuDishRequest,
): Promise<MenuDish> {
  const response = await fetch("/api/menu-dishes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    throw new Error(`Create menu dish failed with status ${response.status}`);
  }
  return (await response.json()) as MenuDish;
}
