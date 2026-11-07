import { useEffect, useState } from "react";
import { getCurrentUser, logout, type AuthenticatedUser } from "@/api/authApi";
import { getCurrentOrder, type CurrentOrder } from "@/api/orderApi";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  getMenu,
  type Product,
} from "@/api/productApi";
import AddToOrder from "@/components/AddToOrder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function MenuPage() {
  const [state, setState] = useState<MenuState>({ kind: "loading" });
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [order, setOrder] = useState<CurrentOrder | null>(null);
  const isCustomer = user?.role === "CUSTOMER";

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

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Sabor del Himalaya · Carta</h1>

      {/* P1 without session, P1b with session (US-10). */}
      <div className="mb-6 flex gap-4">
        {user ? (
          <>
            <span>Hola, {user.login}</span>
            {isCustomer && (
              <>
                <a href="/order" className="underline">
                  Pedido actual ({countUnits(order)})
                </a>
                <a href="/my-orders" className="underline">
                  Mis pedidos
                </a>
              </>
            )}

            <button
              onClick={() => logout().then(() => window.location.reload())}
              className="underline"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="underline">
              Iniciar sesión
            </a>
            <a href="/register" className="underline">
              Regístrate
            </a>
          </>
        )}
      </div>

      {state.kind === "loading" && (
        <p className="text-muted-foreground">Cargando la carta…</p>
      )}

      {state.kind === "error" && (
        <p className="text-destructive">
          No se ha podido cargar la carta. Inténtalo de nuevo más tarde.
        </p>
      )}

      {state.kind === "loaded" &&
        CATEGORY_ORDER.map((category) => {
          const products = state.products.filter(
            (product) => product.category === category,
          );
          if (products.length === 0) {
            return null;
          }
          return (
            <section key={category} className="mb-8">
              <h2 className="mb-3 text-xl font-semibold">
                {CATEGORY_LABEL[category]}
              </h2>
              <div className="grid gap-3">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        <span>{product.name}</span>
                        <span>{priceFormatter.format(product.price)}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">
                      {product.description}
                      {isCustomer && (
                        <AddToOrder productId={product.id} onAdded={setOrder} />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
    </main>
  );
}
