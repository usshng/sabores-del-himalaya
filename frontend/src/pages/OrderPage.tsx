import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/authApi";
import { getCurrentOrder, type CurrentOrder } from "@/api/orderApi";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

// P6: the order the customer is composing (US-11). Total and confirmation arrive with US-13 and US-14.
export default function OrderPage() {
  const [order, setOrder] = useState<CurrentOrder | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "CUSTOMER") {
        window.location.href = "/login";
        return;
      }
      getCurrentOrder().then(setOrder);
    });
  }, []);

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
        <ul className="mb-6 divide-y rounded-md border">
          {order.items.map((item) => (
            <li key={item.productId} className="flex justify-between p-3">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>{priceFormatter.format(item.unitPrice)}</span>
            </li>
          ))}
        </ul>
      )}

      <a href="/" className="underline">
        Volver a la carta
      </a>
    </main>
  );
}
