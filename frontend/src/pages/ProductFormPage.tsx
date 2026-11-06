import { useEffect, useState, type FormEvent } from "react";
import { getCurrentUser } from "@/api/authApi";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  createProduct,
  type ProductCategory,
} from "@/api/productApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OWNER_MENU_URL = "/owner/menu";

// P9: form to add a product to the menu (US-02).
export default function ProductFormPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>("STARTERS");
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "OWNER") {
        window.location.href = "/login";
      }
    });
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(false);
    createProduct({ name, description, price: Number(price), category })
      .then(() => {
        window.location.href = OWNER_MENU_URL;
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
          <CardTitle>Nuevo producto</CardTitle>
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
