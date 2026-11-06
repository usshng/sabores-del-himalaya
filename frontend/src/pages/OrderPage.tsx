import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/authApi";
import {
  confirmOrder,
  getCurrentOrder,
  type CurrentOrder,
  type PlacedOrder,
} from "@/api/orderApi";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

// P6: the customer reviews the order in progress with its total (US-11, US-13) and confirms it (US-14).
export default function OrderPage() {
  const [order, setOrder] = useState<CurrentOrder | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "CUSTOMER") {
        window.location.href = "/login";
        return;
      }
      getCurrentOrder().then(setOrder);
    });
  }, []);

  function handleConfirm() {
    setError(false);
    confirmOrder()
      .then(setPlaced)
      .catch(() => setError(true));
  }

  if (placed) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-2 text-2xl font-bold">Pedido confirmado</h1>
        <p className="mb-6 text-muted-foreground">
          Tu pedido se ha enviado al restaurante el{" "}
          {dateTimeFormatter.format(new Date(placed.placedAt))} por un total de{" "}
          {priceFormatter.format(placed.total)}. Estado: Recibido.
        </p>
        <a href="/" className="underline">
          Volver a la carta
        </a>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Pedido actual</h1>

      {order.items.length === 0 ? (
        <p className="mb-6 text-muted-foreground">
          Todavía no has añadido ningún producto.
        </p>
      ) : (
        <>
          <div className="mb-6 rounded-md border">
            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.productId} className="flex justify-between p-3">
                  <span>
                    {item.name} · {priceFormatter.format(item.unitPrice)} ×{" "}
                    {item.quantity}
                  </span>
                  <span>{priceFormatter.format(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t p-3 font-semibold">
              <span>Total</span>
              <span>{priceFormatter.format(order.total)}</span>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="mb-6 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
          >
            Confirmar pedido
          </button>
          {error && (
            <p className="mb-6 text-sm text-destructive">
              No se ha podido confirmar el pedido. Inténtalo de nuevo.
            </p>
          )}
        </>
      )}

      <div>
        <a href="/" className="underline">
          Volver a la carta
        </a>
      </div>
    </main>
  );
}
