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
import LoginDialog from "@/components/LoginDialog";
import SiteHeader from "@/components/SiteHeader";

type MenuState =
  | { kind: "loading" }
  | { kind: "loaded"; products: Product[] }
  | { kind: "error" };

const LOGIN_PATH = "/login";
const MENU_PATH = "/carta";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

function countUnits(order: CurrentOrder | null): number {
  return order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

// P1 / P1b: the menu, one category per tab (US-01), with quantity and "Añadir" (US-11).
// The login dialog (P5) opens over it without reloading; at /login it starts open.
export default function MenuPage() {
  const [state, setState] = useState<MenuState>({ kind: "loading" });
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [order, setOrder] = useState<CurrentOrder | null>(null);
  const [category, setCategory] = useState<ProductCategory>("STARTERS");
  const [showLogin, setShowLogin] = useState(
    () => window.location.pathname === LOGIN_PATH,
  );

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

  // The browser's back button closes or reopens the dialog, following the address.
  useEffect(() => {
    function handlePopState() {
      setShowLogin(window.location.pathname === LOGIN_PATH);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function openLogin() {
    window.history.pushState(null, "", LOGIN_PATH);
    setShowLogin(true);
  }

  function closeLogin() {
    window.history.replaceState(null, "", MENU_PATH);
    setShowLogin(false);
  }

  function handleCustomerLoggedIn(loggedIn: AuthenticatedUser) {
    setUser(loggedIn);
    getCurrentOrder().then(setOrder);
    closeLogin();
  }

  const products =
    state.kind === "loaded"
      ? state.products.filter((product) => product.category === category)
      : [];

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <SiteHeader
        user={user}
        orderUnits={countUnits(order)}
        onLogin={openLogin}
      />

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

        {/* The key recreates the grid on every tab change, so the cards animate in again. */}
        <div
          key={category}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-500 animate-in fade-in slide-in-from-bottom-4 hover:shadow-md"
            >
              <p className="mb-1.5 text-xs tracking-wide text-neutral-400">
                {CATEGORY_LABEL[product.category]}
              </p>
              <h2 className="mb-1.5 text-lg font-semibold">{product.name}</h2>
              <p className="flex-1 text-sm leading-relaxed text-neutral-600">
                {product.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-neutral-200 pt-4">
                <span className="mr-auto text-lg font-semibold">
                  {priceFormatter.format(product.price)}
                </span>
                {!isStaff && (
                  <AddToOrder
                    productId={product.id}
                    canOrder={isCustomer}
                    onAdded={setOrder}
                    onLoginRequired={openLogin}
                  />
                )}
              </div>
            </article>
          ))}
        </div>
      </main>

      {showLogin && (
        <LoginDialog
          onClose={closeLogin}
          onCustomerLoggedIn={handleCustomerLoggedIn}
        />
      )}
    </div>
  );
}
