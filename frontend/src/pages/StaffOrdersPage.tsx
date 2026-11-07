import { navigate } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/api/authApi";
import type { OrderStatus } from "@/api/orderApi";
import {
  getReceivedOrder,
  getReceivedOrders,
  updateOrderStatus,
  type ReceivedOrder,
  type ReceivedOrderDetail,
} from "@/api/staffOrderApi";

const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "Recibido",
  IN_PREPARATION: "En preparación",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

// Statuses the staff can set (US-19); only the customer can cancel (US-16).
const STAFF_STATUSES: OrderStatus[] = [
  "IN_PREPARATION",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

// P13: orders received by the restaurant (US-18) and their status changes (US-19).
export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<ReceivedOrder[] | null>(null);
  const [selected, setSelected] = useState<ReceivedOrderDetail | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "STAFF") {
        navigate("/login");
        return;
      }
      getReceivedOrders().then(setOrders);
    });
  }, []);

  function handleStatusChange(status: OrderStatus) {
    if (!selected) {
      return;
    }
    setError(false);
    updateOrderStatus(selected.id, status)
      .then((updated) => {
        setSelected(updated);
        setOrders(
          (current) =>
            current?.map((order) =>
              order.id === updated.id
                ? { ...order, status: updated.status }
                : order,
            ) ?? null,
        );
      })
      .catch(() => setError(true));
  }

  if (!orders) {
    return null;
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos recibidos</h1>
        <button
          onClick={() => logout().then(() => navigate("/"))}
          className="underline"
        >
          Cerrar sesión
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="text-muted-foreground">No hay pedidos recibidos.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <ul className="divide-y rounded-md border">
            {orders.map((order) => (
              <li key={order.id}>
                <button
                  onClick={() => {
                    setError(false);
                    getReceivedOrder(order.id).then(setSelected);
                  }}
                  className={`w-full p-3 text-left hover:bg-muted ${
                    selected?.id === order.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex justify-between font-medium">
                    <span>
                      #{order.id} · {order.customerName}
                    </span>
                    <span>{STATUS_LABEL[order.status]}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.customerAddress} ·{" "}
                    {dateTimeFormatter.format(new Date(order.placedAt))}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {selected ? (
            <div className="rounded-md border p-4">
              <h2 className="mb-1 text-lg font-semibold">
                Pedido #{selected.id} · {STATUS_LABEL[selected.status]}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                {selected.customerName} · {selected.customerAddress}
              </p>
              <ul className="mb-4 divide-y">
                {selected.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex justify-between py-2"
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <span>{priceFormatter.format(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mb-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>{priceFormatter.format(selected.total)}</span>
              </div>

              {selected.status === "CANCELLED" ? (
                <p className="text-sm text-muted-foreground">
                  El cliente canceló este pedido: ya no puede cambiar de estado.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {STAFF_STATUSES.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={selected.status === status}
                      className="rounded-md border px-3 py-1 text-sm hover:bg-muted disabled:opacity-50"
                    >
                      {STATUS_LABEL[status]}
                    </button>
                  ))}
                </div>
              )}
              {error && (
                <p className="mt-3 text-sm text-destructive">
                  No se ha podido cambiar el estado.
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Selecciona un pedido para ver su contenido.
            </p>
          )}
        </div>
      )}
    </main>
  );
}
