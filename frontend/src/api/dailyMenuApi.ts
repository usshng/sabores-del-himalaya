export interface DailyMenuDish {
  id: number;
  name: string;
  description: string;
}

export interface DailyMenu {
  id: number;
  date: string;
  price: number;
  starters: DailyMenuDish[];
  mainCourses: DailyMenuDish[];
  desserts: DailyMenuDish[];
  drink: DailyMenuDish;
}

export interface CreateDailyMenuRequest {
  date: string;
  starterIds: number[];
  mainCourseIds: number[];
  dessertIds: number[];
  drinkId: number;
}

// The two errors the chef can fix: the day already has a menu (409) or a dish is not valid (400).
export type DailyMenuError = "ALREADY_EXISTS" | "INVALID" | "UNKNOWN";

// Configures the menu of a day (US-05). Only the chef can call it.
export async function createDailyMenu(
  request: CreateDailyMenuRequest,
): Promise<DailyMenu> {
  const response = await fetch("/api/daily-menus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (response.status === 409) {
    throw new Error("ALREADY_EXISTS");
  }
  if (response.status === 400) {
    throw new Error("INVALID");
  }
  if (!response.ok) {
    throw new Error("UNKNOWN");
  }
  return (await response.json()) as DailyMenu;
}
