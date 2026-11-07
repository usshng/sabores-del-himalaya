import { useState } from "react";
import { Minus, Plus } from "lucide-react";
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
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          aria-label="Quitar uno"
          className="flex size-7 items-center justify-center rounded-full border hover:bg-neutral-100"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-6 text-center tabular-nums">{quantity}</span>
        <button
          onClick={() => setQuantity((current) => current + 1)}
          aria-label="Añadir uno"
          className="flex size-7 items-center justify-center rounded-full border hover:bg-neutral-100"
        >
          <Plus className="size-3.5" />
        </button>
        <button
          onClick={handleAdd}
          className="ml-1 rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium hover:bg-neutral-300"
        >
          Añadir
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-destructive">No se ha podido añadir.</p>
      )}
    </div>
  );
}
