import { useEffect, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import {
  getTodayMenu,
  type DailyMenu,
  type DailyMenuDish,
} from "@/api/dailyMenuApi";
import { addMenuToOrder, type CurrentOrder } from "@/api/orderApi";

// The menu is null when the chef hasn't configured it for today (P2b).
type TodayMenuState =
  | { kind: "loading" }
  | { kind: "loaded"; menu: DailyMenu | null }
  | { kind: "error" };

interface DailyMenuViewProps {
  // The staff only looks at the menu, so we don't show the dishes to choose nor the button.
  showOrder: boolean;
  canOrder: boolean;
  onAdded: (order: CurrentOrder) => void;
  // Only registered customers can order (US-10), so a visitor goes to the login.
  onLoginRequired: () => void;
}

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function DailyMenuView({
  showOrder,
  canOrder,
  onAdded,
  onLoginRequired,
}: DailyMenuViewProps) {
  const [state, setState] = useState<TodayMenuState>({ kind: "loading" });
  const [starterId, setStarterId] = useState<number | null>(null);
  const [mainCourseId, setMainCourseId] = useState<number | null>(null);
  const [dessertId, setDessertId] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTodayMenu()
      .then((menu) => setState({ kind: "loaded", menu }))
      .catch(() => setState({ kind: "error" }));
  }, []);

  if (state.kind === "loading") {
    return <p className="text-neutral-600">Cargando el menú del día…</p>;
  }

  if (state.kind === "error") {
    return (
      <p className="text-destructive">
        No se ha podido cargar el menú del día. Inténtalo de nuevo más tarde.
      </p>
    );
  }

  if (state.menu === null) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">
          Menú del día no disponible
        </h2>
        <p className="text-neutral-600">
          Hoy no hay menú del día. Puedes pedir cualquier producto de la carta.
        </p>
      </div>
    );
  }

  const { menu } = state;
  const complete =
    starterId !== null && mainCourseId !== null && dessertId !== null;

  // The customer chooses again for each new menu, because two menus can have different dishes (US-12).
  function choose(select: (id: number) => void, id: number) {
    setAdded(false);
    select(id);
  }

  function handleAdd() {
    if (!canOrder) {
      onLoginRequired();
      return;
    }
    if (starterId === null || mainCourseId === null || dessertId === null) {
      return;
    }
    setError(false);
    addMenuToOrder(starterId, mainCourseId, dessertId)
      .then((order) => {
        onAdded(order);
        setStarterId(null);
        setMainCourseId(null);
        setDessertId(null);
        setAdded(true);
      })
      .catch(() => setError(true));
  }

  return (
    <article className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 shadow-sm duration-500 animate-in fade-in slide-in-from-bottom-4">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 pb-4">
        <div>
          <p className="text-xs tracking-wide text-neutral-400">Menú del día</p>
          {/* T00:00 reads the date as local time, so the day doesn't move with the time zone. */}
          <h2 className="text-2xl font-semibold first-letter:uppercase">
            {dateFormatter.format(new Date(`${menu.date}T00:00`))}
          </h2>
        </div>
        <span className="text-2xl font-semibold">
          {priceFormatter.format(menu.price)}
        </span>
      </header>

      <MenuSection
        title="Primeros"
        dishes={menu.starters}
        selectedId={starterId}
        onSelect={showOrder ? (id) => choose(setStarterId, id) : undefined}
      />
      <MenuSection
        title="Segundos"
        dishes={menu.mainCourses}
        selectedId={mainCourseId}
        onSelect={showOrder ? (id) => choose(setMainCourseId, id) : undefined}
      />
      <MenuSection
        title="Postres"
        dishes={menu.desserts}
        selectedId={dessertId}
        onSelect={showOrder ? (id) => choose(setDessertId, id) : undefined}
      />
      <MenuSection title="Bebida incluida" dishes={[menu.drink]} />

      <footer className="mt-6 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
        <p className="mr-auto text-sm text-neutral-500">
          {showOrder
            ? "Elige un primero, un segundo y un postre. La bebida está incluida."
            : "Incluye un primero, un segundo, un postre y la bebida."}
        </p>
        {added && (
          <p className="flex items-center gap-1 text-sm text-green-700">
            <Check className="size-4" />
            Menú añadido al pedido
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            No se ha podido añadir el menú.
          </p>
        )}
        {showOrder && (
          <button
            onClick={handleAdd}
            disabled={canOrder && !complete}
            className="flex h-10 items-center gap-1.5 rounded-full bg-black px-5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:active:scale-100"
          >
            <ShoppingBag className="size-4" />
            Añadir menú al pedido
          </button>
        )}
      </footer>
    </article>
  );
}

// Without onSelect the dishes are only shown, like the drink or when the staff looks at the menu.
function MenuSection({
  title,
  dishes,
  selectedId,
  onSelect,
}: {
  title: string;
  dishes: DailyMenuDish[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
}) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
        {title}
      </h3>
      <ul className="space-y-2">
        {dishes.map((dish) => {
          const selected = dish.id === selectedId;
          const content = (
            <>
              <p className="font-medium">{dish.name}</p>
              {/* Dishes only for menus may not have a description (US-06). */}
              {dish.description && (
                <p className="text-sm text-neutral-600">{dish.description}</p>
              )}
            </>
          );
          return (
            <li key={dish.id}>
              {onSelect ? (
                <button
                  onClick={() => onSelect(dish.id)}
                  className={`flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left transition ${
                    selected
                      ? "border-black bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-400"
                  }`}
                >
                  <div>{content}</div>
                  {selected && <Check className="mt-0.5 size-4 shrink-0" />}
                </button>
              ) : (
                content
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
