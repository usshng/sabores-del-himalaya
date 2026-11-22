import { useEffect, useState } from "react";
import {
  getTodayMenu,
  type DailyMenu,
  type DailyMenuDish,
} from "@/api/dailyMenuApi";

// The menu is null when the chef hasn't configured it for today (P2b).
type TodayMenuState =
  | { kind: "loading" }
  | { kind: "loaded"; menu: DailyMenu | null }
  | { kind: "error" };

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default function DailyMenuView() {
  const [state, setState] = useState<TodayMenuState>({ kind: "loading" });

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

      <MenuSection title="Primeros" dishes={menu.starters} />
      <MenuSection title="Segundos" dishes={menu.mainCourses} />
      <MenuSection title="Postres" dishes={menu.desserts} />
      <MenuSection title="Bebida" dishes={[menu.drink]} />

      <p className="mt-6 border-t border-neutral-200 pt-4 text-sm text-neutral-500">
        Incluye un primero, un segundo, un postre y la bebida.
      </p>
    </article>
  );
}

function MenuSection({
  title,
  dishes,
}: {
  title: string;
  dishes: DailyMenuDish[];
}) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
        {title}
      </h3>
      <ul className="space-y-2">
        {dishes.map((dish) => (
          <li key={dish.id}>
            <p className="font-medium">{dish.name}</p>
            {/* Dishes only for menus may not have a description (US-06). */}
            {dish.description && (
              <p className="text-sm text-neutral-600">{dish.description}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
