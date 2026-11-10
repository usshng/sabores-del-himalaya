import { useEffect, useState } from "react";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { getCurrentUser, type AuthenticatedUser } from "@/api/authApi";
import {
  confirmOrder,
  getCurrentOrder,
  type CurrentOrder,
  type PlacedOrder,
} from "@/api/orderApi";
import SiteHeader from "@/components/SiteHeader";
import { navigate } from "@/lib/navigation";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

function countUnits(order: CurrentOrder | null): number {
  return order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

export default function OrderPage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [order, setOrder] = useState<CurrentOrder | null>(null);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [error, setError] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getCurrentUser().then((current) => {
      if (current?.role !== "CUSTOMER") {
        navigate("/login");
        return;
      }
      setUser(current);
      getCurrentOrder().then(setOrder);
    });
  }, []);

  function handleConfirm() {
    setError(false);
    setSending(true);
    confirmOrder()
      .then(setPlaced)
      .catch(() => {
        setError(true);
        setSending(false);
      });
  }

  if (!user || !order) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <SiteHeader
        user={user}
        orderUnits={placed ? 0 : countUnits(order)}
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
        {placed ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <CircleCheck className="mx-auto mb-4 size-12" />
            <h1 className="mb-2 text-2xl font-semibold">Pedido confirmado</h1>
            <p className="mb-6 text-neutral-600">
              Lo hemos enviado al restaurante el{" "}
              {dateTimeFormatter.format(new Date(placed.placedAt))} por un total
              de{" "}
              <span className="font-semibold text-black">
                {priceFormatter.format(placed.total)}
              </span>
              . Estado: Recibido.
            </p>
            <div className="flex justify-center gap-3">
              <a
                href="/my-orders"
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
              >
                Ver mis pedidos
              </a>
              <a
                href="/carta"
                className="rounded-full border border-neutral-300 bg-white px-5 py-2 text-sm font-medium hover:bg-neutral-100"
              >
                Seguir en la carta
              </a>
            </div>
          </div>
        ) : order.items.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <h1 className="mb-2 text-xl font-semibold">Tu pedido está vacío</h1>
            <p className="mb-6 text-neutral-600">
              Añade productos desde la carta para empezar.
            </p>
            <a
              href="/carta"
              className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Ver la carta
            </a>
          </div>
        ) : (
          <>
            <h1 className="mb-4 text-2xl font-semibold">Pedido actual</h1>

            <ul className="grid gap-3">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-neutral-500">
                      {priceFormatter.format(item.unitPrice)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold tabular-nums">
                    {priceFormatter.format(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-neutral-400 pt-4">
              <div className="flex items-baseline justify-end gap-3">
                <span className="text-neutral-600">Importe total</span>
                <span className="text-2xl font-semibold tabular-nums">
                  {priceFormatter.format(order.total)}
                </span>
              </div>
              <div className="mt-4 flex flex-col items-end gap-2">
                <button
                  onClick={handleConfirm}
                  disabled={sending}
                  className="rounded-full bg-black px-6 py-2.5 font-medium text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
                >
                  {sending ? "Confirmando…" : "Confirmar pedido"}
                </button>
                {error && (
                  <p className="text-sm text-destructive">
                    No se ha podido confirmar el pedido. Inténtalo de nuevo.
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
