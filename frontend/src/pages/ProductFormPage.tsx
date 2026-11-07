import { navigate } from "@/lib/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { getCurrentUser } from "@/api/authApi";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  createProduct,
  getProduct,
  updateProduct,
  type ProductCategory,
} from "@/api/productApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OWNER_MENU_URL = "/owner/menu";

// P9: form to add a product (US-02) or, with ?id=…, to modify an existing one (US-03).
export default function ProductFormPage() {
  const idParam = new URLSearchParams(window.location.search).get("id");
  const productId = idParam ? Number(idParam) : null;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>("STARTERS");
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "OWNER") {
        navigate("/login");
        return;
      }
      if (productId !== null) {
        getProduct(productId)
          .then((product) => {
            setName(product.name);
            setDescription(product.description ?? "");
            setPrice(String(product.price));
            setCategory(product.category);
          })
          .catch(() => setError(true));
      }
    });
  }, [productId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(false);
    const request = { name, description, price: Number(price), category };
    const save =
      productId === null
        ? createProduct(request)
        : updateProduct(productId, request);
    save
      .then(() => {
        navigate(OWNER_MENU_URL);
      })
      .catch(() => {
        setError(true);
        setSending(false);
      });
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            {productId === null ? "Nuevo producto" : "Modificar producto"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <label className="grid gap-1 text-sm">
              Nombre
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Descripción
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Precio (€)
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Categoría
              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ProductCategory)
                }
                className="rounded-md border px-3 py-2"
              >
                {CATEGORY_ORDER.map((option) => (
                  <option key={option} value={option}>
                    {CATEGORY_LABEL[option]}
                  </option>
                ))}
              </select>
            </label>
            {error && (
              <p className="text-sm text-destructive">
                No se ha podido guardar el producto. Revisa los datos.
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground disabled:opacity-50"
              >
                {sending ? "Guardando…" : "Guardar"}
              </button>
              <a
                href={OWNER_MENU_URL}
                className="flex-1 rounded-md border px-3 py-2 text-center"
              >
                Cancelar
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
