import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { addProductToOrder, type CurrentOrder } from "@/api/orderApi";

interface AddToOrderProps {
  productId: number;
  canOrder: boolean;
  onAdded: (order: CurrentOrder) => void;
  // Called when a visitor without a session tries to add: only registered customers can order (US-10).
  onLoginRequired: () => void;
}

// Quantity selector (− 1 +) and "Añadir" button of each product (US-11).
export default function AddToOrder({
  productId,
  canOrder,
  onAdded,
  onLoginRequired,
}: AddToOrderProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);

  function handleAdd() {
    if (!canOrder) {
      onLoginRequired();
      return;
    }
    setError(false);
    addProductToOrder(productId, quantity)
      .then((order) => {
        onAdded(order);
        setQuantity(1);
      })
      .catch(() => setError(true));
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <div className="flex h-9 items-center rounded-full border border-neutral-300">
          <button
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            aria-label="Quitar uno"
            className="flex h-full w-8 items-center justify-center rounded-l-full text-neutral-500 hover:bg-neutral-100 hover:text-black"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="min-w-5 text-center text-sm font-medium tabular-nums">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((current) => current + 1)}
            aria-label="Añadir uno"
            className="flex h-full w-8 items-center justify-center rounded-r-full text-neutral-500 hover:bg-neutral-100 hover:text-black"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <button
          onClick={handleAdd}
          className="flex h-9 items-center gap-1.5 rounded-full bg-black px-4 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95"
        >
          <ShoppingBag className="size-4" />
          Añadir
        </button>
      </div>
      {error && (
        <p className="text-xs text-destructive">No se ha podido añadir.</p>
      )}
    </div>
  );
}
