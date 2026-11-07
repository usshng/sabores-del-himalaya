import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/authApi";
import { getMyOrders, type MyOrder, type OrderStatus } from "@/api/orderApi";

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

// P7: the customer's orders with their current status, newest first (US-17).
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<MyOrder[] | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "CUSTOMER") {
        window.location.href = "/login";
        return;
      }
      getMyOrders().then(setOrders);
    });
  }, []);

  if (!orders) {
    return null;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

      {orders.length === 0 ? (
        <p className="mb-6 text-muted-foreground">
          Todavía no has hecho ningún pedido.
        </p>
      ) : (
        <ul className="mb-6 divide-y rounded-md border">
          {orders.map((order) => (
            <li key={order.id} className="flex justify-between p-3">
              <span>
                Pedido #{order.id} ·{" "}
                {dateTimeFormatter.format(new Date(order.placedAt))}
              </span>
              <span className="flex gap-4">
                <span>{priceFormatter.format(order.total)}</span>
                <span className="font-medium">
                  {STATUS_LABEL[order.status]}
                </span>
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
