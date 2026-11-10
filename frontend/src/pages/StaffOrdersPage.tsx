import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/authApi";
import type { OrderStatus } from "@/api/orderApi";
import {
  getReceivedOrder,
  getReceivedOrders,
  updateOrderStatus,
  type ReceivedOrder,
  type ReceivedOrderDetail,
} from "@/api/staffOrderApi";
import StaffHeader from "@/components/StaffHeader";
import { navigate } from "@/lib/navigation";

const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "Recibido",
  IN_PREPARATION: "En preparación",
  OUT_FOR_DELIVERY: "En reparto",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  RECEIVED: "bg-black text-white",
  IN_PREPARATION: "bg-neutral-600 text-white",
  OUT_FOR_DELIVERY: "bg-neutral-200 text-black",
  DELIVERED: "border border-neutral-300 bg-white text-neutral-600",
  CANCELLED: "bg-neutral-100 text-neutral-400 line-through",
};

const STAFF_STATUSES: OrderStatus[] = [
  "IN_PREPARATION",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const shortDateTime = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const fullDateTime = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function suggestedStatus(current: OrderStatus): OrderStatus {
  if (current === "IN_PREPARATION") {
    return "OUT_FOR_DELIVERY";
  }
  if (current === "OUT_FOR_DELIVERY" || current === "DELIVERED") {
    return "DELIVERED";
  }
  return "IN_PREPARATION";
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block min-w-32 rounded-md px-3 py-1 text-center text-sm font-medium ${STATUS_STYLE[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<ReceivedOrder[] | null>(null);
  const [selected, setSelected] = useState<ReceivedOrderDetail | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("IN_PREPARATION");
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "STAFF") {
        navigate("/login");
        return;
      }
      getReceivedOrders().then(setOrders);
    });
  }, []);

  function handleSelect(id: number) {
    setError(false);
    getReceivedOrder(id).then((detail) => {
      setSelected(detail);
      setNewStatus(suggestedStatus(detail.status));
    });
  }

  function handleUpdate() {
    if (!selected) {
      return;
    }
    setError(false);
    setSaving(true);
    updateOrderStatus(selected.id, newStatus)
      .then((updated) => {
        setSelected(updated);
        setNewStatus(suggestedStatus(updated.status));
        setOrders(
          (current) =>
            current?.map((order) =>
              order.id === updated.id
                ? { ...order, status: updated.status }
                : order,
            ) ?? null,
        );
      })
      .catch(() => setError(true))
      .finally(() => setSaving(false));
  }

  if (!orders) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <StaffHeader
        panelLabel="Panel del personal"
        links={[{ href: "/staff/orders", label: "Pedidos" }]}
      />

      <h1 className="bg-white py-4 text-center text-lg font-medium">
        Pedidos recibidos
      </h1>

      <main className="mx-auto w-full max-w-6xl flex-1 p-6">
        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-neutral-600 shadow-sm">
            Todavía no hay pedidos recibidos.
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
            <section>
              <div className="mb-2 hidden grid-cols-[7rem_1fr_9rem] gap-4 px-5 text-xs text-neutral-500 sm:grid">
                <span>Fecha y hora</span>
                <span>Cliente y dirección</span>
                <span className="text-center">Estado</span>
              </div>
              <ul className="grid gap-3">
                {orders.map((order) => {
                  const isSelected = selected?.id === order.id;
                  return (
                    <li key={order.id}>
                      <button
                        onClick={() => handleSelect(order.id)}
                        className={`grid w-full gap-x-4 gap-y-1 rounded-xl bg-white px-5 py-4 text-left shadow-sm transition sm:grid-cols-[7rem_1fr_9rem] sm:items-center ${
                          isSelected ? "ring-2 ring-black" : "hover:shadow-md"
                        }`}
                      >
                        <span className="text-sm tabular-nums">
                          {shortDateTime.format(new Date(order.placedAt))}
                        </span>
                        <span>
                          <span className="block font-medium">
                            {order.customerName}
                          </span>
                          <span className="block text-sm text-neutral-500">
                            {order.customerAddress}
                          </span>
                        </span>
                        <span className="sm:text-center">
                          <StatusBadge status={order.status} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <aside className="rounded-xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
              {selected ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-semibold">
                      Pedido #{selected.id} ·{" "}
                      {fullDateTime.format(new Date(selected.placedAt))}
                    </h2>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="mb-4 text-sm text-neutral-500">
                    {selected.customerName} · {selected.customerAddress}
                  </p>

                  <ul className="grid gap-2 border-t border-dashed border-neutral-400 pt-4">
                    {selected.items.map((item) => (
                      <li key={item.productId} className="flex justify-between">
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <span className="text-neutral-500 tabular-nums">
                          {priceFormatter.format(item.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-baseline justify-between border-t border-black pt-4">
                    <span>Importe total</span>
                    <span className="text-xl font-semibold tabular-nums">
                      {priceFormatter.format(selected.total)}
                    </span>
                  </div>

                  {selected.status === "CANCELLED" ? (
                    <p className="mt-6 text-sm text-neutral-500">
                      El cliente canceló este pedido: ya no puede cambiar de
                      estado.
                    </p>
                  ) : (
                    <div className="mt-6">
                      <label
                        htmlFor="new-status"
                        className="mb-1 block text-xs text-neutral-500"
                      >
                        Cambiar estado
                      </label>
                      <div className="flex gap-2">
                        <select
                          id="new-status"
                          value={newStatus}
                          onChange={(event) =>
                            setNewStatus(event.target.value as OrderStatus)
                          }
                          className="flex-1 rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm"
                        >
                          {STAFF_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_LABEL[status]}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleUpdate}
                          disabled={saving || newStatus === selected.status}
                          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-40"
                        >
                          {saving ? "Actualizando…" : "Actualizar"}
                        </button>
                      </div>
                      {error && (
                        <p className="mt-2 text-sm text-destructive">
                          No se ha podido cambiar el estado.
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-neutral-500">
                  Selecciona un pedido para ver su contenido.
                </p>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
