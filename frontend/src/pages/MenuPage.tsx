import { useEffect, useState } from "react";
import { getCurrentUser, type AuthenticatedUser } from "@/api/authApi";
import { getCurrentOrder, type CurrentOrder } from "@/api/orderApi";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  getMenu,
  type Product,
  type ProductCategory,
} from "@/api/productApi";
import AddToOrder from "@/components/AddToOrder";
import SiteHeader from "@/components/SiteHeader";

type MenuState =
  | { kind: "loading" }
  | { kind: "loaded"; products: Product[] }
  | { kind: "error" };

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

function countUnits(order: CurrentOrder | null): number {
  return order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

// P1 / P1b: the menu, one category per tab (US-01), with quantity and "Añadir" (US-11).
export default function MenuPage() {
  const [state, setState] = useState<MenuState>({ kind: "loading" });
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [order, setOrder] = useState<CurrentOrder | null>(null);
  const [category, setCategory] = useState<ProductCategory>("STARTERS");
  const isCustomer = user?.role === "CUSTOMER";
  const isStaff = user !== null && !isCustomer;

  useEffect(() => {
    getCurrentUser().then((current) => {
      setUser(current);
      if (current?.role === "CUSTOMER") {
        getCurrentOrder().then(setOrder);
      }
    });
  }, []);

  useEffect(() => {
    getMenu()
      .then((products) => setState({ kind: "loaded", products }))
      .catch(() => setState({ kind: "error" }));
  }, []);

  const products =
    state.kind === "loaded"
      ? state.products.filter((product) => product.category === category)
      : [];

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <SiteHeader user={user} orderUnits={countUnits(order)} />

      <nav className="flex items-center gap-6 overflow-x-auto border-b bg-white px-6 py-4 text-sm">
        {CATEGORY_ORDER.map((option) => (
          <button
            key={option}
            onClick={() => setCategory(option)}
            className={`shrink-0 border-b-2 pb-1 ${
              option === category
                ? "border-black font-semibold"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            {CATEGORY_LABEL[option]}
          </button>
        ))}
        {/* The daily menu arrives in Sprint 2 (US-07). */}
        <span
          className="ml-auto shrink-0 cursor-not-allowed text-neutral-400"
          title="Próximamente"
        >
          Menú del día →
        </span>
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        {state.kind === "loading" && (
          <p className="text-neutral-600">Cargando la carta…</p>
        )}

        {state.kind === "error" && (
          <p className="text-destructive">
            No se ha podido cargar la carta. Inténtalo de nuevo más tarde.
          </p>
        )}

        {state.kind === "loaded" && products.length === 0 && (
          <p className="text-neutral-600">
            No hay productos en esta categoría.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col rounded-md bg-white p-5 shadow-sm"
            >
              <h2 className="mb-2 text-center font-semibold">{product.name}</h2>
              <p className="mb-6 flex-1 text-center text-sm text-neutral-600">
                {product.description}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">
                  {priceFormatter.format(product.price)}
                </span>
                {!isStaff && (
                  <AddToOrder
                    productId={product.id}
                    canOrder={isCustomer}
                    onAdded={setOrder}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
