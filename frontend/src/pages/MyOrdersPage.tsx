import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser, type AuthenticatedUser } from "@/api/authApi";
import {
  CANCELLATION_PERIOD_MS,
  cancelOrder,
  getCurrentOrder,
  getMyOrders,
  type CurrentOrder,
  type MyOrder,
  type OrderStatus,
} from "@/api/orderApi";
import SiteHeader from "@/components/SiteHeader";
import { navigate } from "@/lib/navigation";

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
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function countUnits(order: CurrentOrder | null): number {
  return order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

export default function MyOrdersPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [currentOrder, setCurrentOrder] = useState<CurrentOrder | null>(null);
  const [now] = useState(() => Date.now());
  const [error, setError] = useState(false);

  useEffect(() => {
    getCurrentUser().then((current) => {
      if (current?.role !== "CUSTOMER") {
        navigate("/login");
        return;
      }
      setUser(current);
      getMyOrders().then(setOrders);
      getCurrentOrder().then(setCurrentOrder);
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

  if (!user || !orders) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <SiteHeader
        user={user}
        orderUnits={countUnits(currentOrder)}
        backHref="/carta"
      />

      <div className="bg-white px-6 py-4">
        <a
          href="/carta"
          className="inline-flex items-center gap-2 text-sm hover:underline"
        >
          <ArrowLeft className="size-4" />
          Volver a la carta
        </a>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        <h1 className="mb-4 text-2xl font-semibold">Mis pedidos</h1>

        {error && (
          <p className="mb-4 rounded-md bg-white px-4 py-3 text-sm text-destructive">
            No se ha podido cancelar: el plazo de 10 minutos ya ha pasado.
          </p>
        )}

        {orders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h2 className="mb-2 text-xl font-semibold">
              Todavía no has hecho ningún pedido
            </h2>
            <p className="mb-6 text-neutral-600">
              Cuando confirmes uno, aquí podrás seguir su estado.
            </p>
            <a
              href="/carta"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Ver la carta
            </a>
          </div>
        ) : (
          <ul className="grid gap-3">
            {orders.map((order) => {
              const cancelled = order.status === "CANCELLED";
              return (
                <li
                  key={order.id}
                  className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-white px-5 py-4 shadow-sm ${
                    cancelled ? "opacity-70" : ""
                  }`}
                >
                  <div className="mr-auto">
                    <p className="font-semibold">Pedido #{order.id}</p>
                    <p className="text-sm text-neutral-500">
                      {dateTimeFormatter.format(new Date(order.placedAt))}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {priceFormatter.format(order.total)}
                  </span>
                  <span
                    className={`min-w-32 rounded-md px-3 py-1 text-center text-sm font-medium ${
                      cancelled
                        ? "bg-neutral-300 text-neutral-700"
                        : "bg-black text-white"
                    }`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                  {canCancel(order) && (
                    <button
                      onClick={() => handleCancel(order)}
                      className="rounded-md bg-neutral-200 px-3 py-1 text-sm font-medium hover:bg-neutral-300"
                    >
                      Cancelar
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
