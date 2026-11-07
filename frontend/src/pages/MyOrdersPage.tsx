import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/authApi";
import {
  CANCELLATION_PERIOD_MS,
  cancelOrder,
  getMyOrders,
  type MyOrder,
  type OrderStatus,
} from "@/api/orderApi";

const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "Recibido",
  IN_PREPARATION: "En preparación",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

// P7: the customer's orders with their status, newest first (US-17), and free cancellation in time (US-16).
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [now] = useState(() => Date.now());
  const [error, setError] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "CUSTOMER") {
        window.location.href = "/login";
        return;
      }
      getMyOrders().then(setOrders);
    });
  }, []);

  function canCancel(order: MyOrder): boolean {
    const placedAt = new Date(order.placedAt).getTime();
    return (
      order.status !== "CANCELLED" && now - placedAt <= CANCELLATION_PERIOD_MS
    );
  }

  function handleCancel(order: MyOrder) {
    if (!window.confirm(`¿Cancelar el pedido #${order.id}? No tiene coste.`)) {
      return;
    }
    setError(false);
    cancelOrder(order.id)
      .then((cancelled) =>
        setOrders(
          (current) =>
            current?.map((item) =>
              item.id === cancelled.id ? cancelled : item,
            ) ?? null,
        ),
      )
      .catch(() => setError(true));
  }

  if (!orders) {
    return null;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

      {error && (
        <p className="mb-4 text-sm text-destructive">
          No se ha podido cancelar: el plazo de 10 minutos ya ha pasado.
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mb-6 text-muted-foreground">
          Todavía no has hecho ningún pedido.
        </p>
      ) : (
        <ul className="mb-6 divide-y rounded-md border">
          {orders.map((order) => (
            <li
              key={order.id}
              className="flex items-center justify-between p-3"
            >
              <span>
                Pedido #{order.id} ·{" "}
                {dateTimeFormatter.format(new Date(order.placedAt))}
              </span>
              <span className="flex items-center gap-4">
                <span>{priceFormatter.format(order.total)}</span>
                <span className="font-medium">
                  {STATUS_LABEL[order.status]}
                </span>
                {canCancel(order) && (
                  <button
                    onClick={() => handleCancel(order)}
                    className="text-sm text-destructive underline"
                  >
                    Cancelar
                  </button>
                )}
              </span>
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
