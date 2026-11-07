import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/api/authApi";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  getMenu,
  withdrawProduct,
  type Product,
} from "@/api/productApi";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

// P8: menu management for the owner: add (US-02), modify (US-03) and withdraw (US-04) products.
export default function OwnerMenuPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "OWNER") {
        window.location.href = "/login";
        return;
      }
      getMenu().then(setProducts);
    });
  }, []);

  function handleWithdraw(product: Product) {
    if (!window.confirm(`¿Retirar "${product.name}" de la carta?`)) {
      return;
    }
    setError(false);
    withdrawProduct(product.id)
      .then(() =>
        setProducts(
          (current) =>
            current?.filter((item) => item.id !== product.id) ?? null,
        ),
      )
      .catch(() => setError(true));
  }

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

      {error && (
        <p className="mb-4 text-sm text-destructive">
          No se ha podido retirar el producto.
        </p>
      )}

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
                  <li
                    key={product.id}
                    className="flex items-center justify-between p-3"
                  >
                    <span>{product.name}</span>
                    <span className="flex items-center gap-4">
                      <span>{priceFormatter.format(product.price)}</span>
                      <a
                        href={`/owner/products/edit?id=${product.id}`}
                        className="text-sm underline"
                      >
                        Modificar
                      </a>
                      <button
                        onClick={() => handleWithdraw(product)}
                        className="text-sm text-destructive underline"
                      >
                        Retirar
                      </button>
                    </span>
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
