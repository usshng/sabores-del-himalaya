import { useState } from "react";
import { addProductToOrder, type CurrentOrder } from "@/api/orderApi";

interface AddToOrderProps {
  productId: number;
  onAdded: (order: CurrentOrder) => void;
}

// Quantity selector and "Añadir" button shown on each product of the menu (US-11).
export default function AddToOrder({ productId, onAdded }: AddToOrderProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(false);

  function handleAdd() {
    setError(false);
    addProductToOrder(productId, quantity)
      .then((order) => {
        onAdded(order);
        setQuantity(1);
      })
      .catch(() => setError(true));
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(event) =>
          setQuantity(Math.max(1, Number(event.target.value)))
        }
        aria-label="Cantidad"
        className="w-16 rounded-md border px-2 py-1"
      />
      <button
        onClick={handleAdd}
        className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground"
      >
        Añadir
      </button>
      {error && (
        <span className="text-sm text-destructive">
          No se ha podido añadir.
        </span>
      )}
    </div>
  );
}
