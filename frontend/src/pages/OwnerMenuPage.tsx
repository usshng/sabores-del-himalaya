import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getCurrentUser } from "@/api/authApi";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  getMenu,
  withdrawProduct,
  type Product,
  type ProductCategory,
} from "@/api/productApi";
import ProductDialog from "@/components/ProductDialog";
import StaffHeader from "@/components/StaffHeader";
import { navigate } from "@/lib/navigation";

const OWNER_LINKS = [
  { href: "/owner/menu", label: "Carta" },
  { href: "/owner/billing", label: "Facturación" },
];

const MENU_PATH = "/owner/menu";
const NEW_PATH = "/owner/products/new";
const EDIT_PATH = "/owner/products/edit";

// Which dialog is open: none, a new product, or a product being modified.
type DialogState = null | { productId: number | null };

// The address decides the dialog, so /owner/products/new and /edit?id=… still open it directly.
function dialogFromLocation(): DialogState {
  if (window.location.pathname === NEW_PATH) {
    return { productId: null };
  }
  if (window.location.pathname === EDIT_PATH) {
    const id = new URLSearchParams(window.location.search).get("id");
    return id ? { productId: Number(id) } : null;
  }
  return null;
}

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

// P8: menu management for the owner, one category per tab: add (US-02), modify (US-03) and withdraw (US-04).
// The product form (P9) opens as a dialog over it, without reloading.
export default function OwnerMenuPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [category, setCategory] = useState<ProductCategory>("STARTERS");
  const [dialog, setDialog] = useState<DialogState>(dialogFromLocation);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "OWNER") {
        navigate("/login");
        return;
      }
      getMenu().then(setProducts);
    });
  }, []);

  // The browser's back button closes or reopens the dialog, following the address.
  useEffect(() => {
    function handlePopState() {
      setDialog(dialogFromLocation());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function openNew() {
    window.history.pushState(null, "", NEW_PATH);
    setDialog({ productId: null });
  }

  function openEdit(productId: number) {
    window.history.pushState(null, "", `${EDIT_PATH}?id=${productId}`);
    setDialog({ productId });
  }

  function closeDialog() {
    window.history.replaceState(null, "", MENU_PATH);
    setDialog(null);
  }

  function handleSaved(saved: Product) {
    getMenu().then(setProducts);
    setCategory(saved.category);
    closeDialog();
  }

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

  const inCategory = products.filter(
    (product) => product.category === category,
  );

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <StaffHeader panelLabel="Panel del dueño" links={OWNER_LINKS} />

      <nav className="flex items-center gap-6 overflow-x-auto border-b bg-white px-6 py-4 text-sm">
        {CATEGORY_ORDER.map((option) => {
          const count = products.filter(
            (product) => product.category === option,
          ).length;
          return (
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
              <span className="ml-1.5 text-xs text-neutral-400">{count}</span>
            </button>
          );
        })}
        <button
          onClick={openNew}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-black px-4 py-2 font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus className="size-4" />
          Añadir producto
        </button>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 p-6">
        {error && (
          <p className="mb-4 rounded-md bg-white px-4 py-3 text-sm text-destructive">
            No se ha podido retirar el producto.
          </p>
        )}

        {inCategory.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p className="mb-4 text-neutral-600">
              No hay productos en {CATEGORY_LABEL[category].toLowerCase()}.
            </p>
            <button
              onClick={openNew}
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Añadir producto
            </button>
          </div>
        ) : (
          <ul key={category} className="grid gap-3">
            {inCategory.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl bg-white px-5 py-4 shadow-sm duration-300 animate-in fade-in"
              >
                <div className="mr-auto min-w-0">
                  <p className="font-semibold">{product.name}</p>
                  {product.description && (
                    <p className="truncate text-sm text-neutral-500">
                      {product.description}
                    </p>
                  )}
                </div>
                <span className="font-semibold tabular-nums">
                  {priceFormatter.format(product.price)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium hover:bg-neutral-200"
                  >
                    <Pencil className="size-3.5" />
                    Modificar
                  </button>
                  <button
                    onClick={() => handleWithdraw(product)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-3.5" />
                    Retirar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {dialog && (
        <ProductDialog
          key={dialog.productId ?? "new"}
          productId={dialog.productId}
          defaultCategory={category}
          onClose={closeDialog}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
