import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/api/authApi";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  getMenu,
  type Product,
} from "@/api/productApi";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

// P8: menu management for the owner (US-02; modify and withdraw arrive with US-03 and US-04).
export default function OwnerMenuPage() {
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "OWNER") {
        window.location.href = "/login";
        return;
      }
      getMenu().then(setProducts);
    });
  }, []);

  if (!products) {
    return null;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestión de la carta</h1>
        <button
          onClick={() => logout().then(() => (window.location.href = "/"))}
          className="underline"
        >
          Cerrar sesión
        </button>
      </div>

      <a
        href="/owner/products/new"
        className="mb-6 inline-block rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground"
      >
        Añadir producto
      </a>

      {CATEGORY_ORDER.map((category) => {
        const inCategory = products.filter(
          (product) => product.category === category,
        );
        return (
          <section key={category} className="mb-6">
            <h2 className="mb-2 text-lg font-semibold">
              {CATEGORY_LABEL[category]}
            </h2>
            {inCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin productos.</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {inCategory.map((product) => (
                  <li key={product.id} className="flex justify-between p-3">
                    <span>{product.name}</span>
                    <span>{priceFormatter.format(product.price)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </main>
  );
}
