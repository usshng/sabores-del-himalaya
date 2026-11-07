import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  createProduct,
  getProduct,
  updateProduct,
  type Product,
  type ProductCategory,
} from "@/api/productApi";

interface ProductDialogProps {
  // null to add a new product (US-02), or the id of the product to modify (US-03).
  productId: number | null;
  defaultCategory: ProductCategory;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

// P9: product form as a dialog over the menu management (P8), as in the screen flow (ESQ).
export default function ProductDialog({
  productId,
  defaultCategory,
  onClose,
  onSaved,
}: ProductDialogProps) {
  const isEditing = productId !== null;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<ProductCategory>(defaultCategory);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  // When modifying, the form starts with the current data of the product.
  useEffect(() => {
    if (productId === null) {
      return;
    }
    getProduct(productId)
      .then((product) => {
        setName(product.name);
        setDescription(product.description ?? "");
        setPrice(String(product.price));
        setCategory(product.category);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [productId]);

  // Closes the dialog with the Escape key.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(false);
    const request = { name, description, price: Number(price), category };
    const save =
      productId === null
        ? createProduct(request)
        : updateProduct(productId, request);
    save.then(onSaved).catch(() => {
      setError(true);
      setSending(false);
    });
  }

  const fieldClass =
    "w-full rounded-md bg-neutral-200 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-dialog-title"
        className="relative w-full max-w-lg rounded-xl bg-neutral-950 px-8 py-8 text-white shadow-2xl duration-200 animate-in fade-in zoom-in-95 sm:px-10"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 text-neutral-400 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <h2
          id="product-dialog-title"
          className="mb-6 text-center text-2xl font-semibold"
        >
          {isEditing ? "Modificar producto" : "Añadir producto"}
        </h2>

        {loading ? (
          <p className="py-10 text-center text-neutral-400">
            Cargando el producto…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-1.5 text-sm">
              Nombre
              <input
                required
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              Descripción
              <textarea
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className={`${fieldClass} resize-none`}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                Precio (€)
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                Categoría
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as ProductCategory)
                  }
                  className={fieldClass}
                >
                  {CATEGORY_ORDER.map((option) => (
                    <option key={option} value={option}>
                      {CATEGORY_LABEL[option]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-400">
                No se ha podido guardar el producto. Revisa los datos.
              </p>
            )}

            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-white px-5 py-2 text-sm font-medium hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="rounded-md bg-neutral-200 px-5 py-2 text-sm font-medium text-black hover:bg-white disabled:opacity-50"
              >
                {sending ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
