import { useEffect, useState, type FormEvent } from "react";
import { getCurrentUser } from "@/api/authApi";
import { getDailyBilling, type DailyBilling } from "@/api/billingApi";

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

// "en-CA" formats dates as YYYY-MM-DD in local time, the format the date input and the API use.
function today(): string {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

// P10: daily billing for the owner (US-20).
export default function BillingPage() {
  const [date, setDate] = useState(today);
  const [billing, setBilling] = useState<DailyBilling | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "OWNER") {
        window.location.href = "/login";
      }
    });
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(false);
    getDailyBilling(date)
      .then(setBilling)
      .catch(() => setError(true));
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Facturación diaria</h1>
        <a href="/owner/menu" className="underline">
          Volver a la carta
        </a>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex items-end gap-3">
        <label className="grid gap-1 text-sm">
          Día
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
        >
          Consultar
        </button>
      </form>

      {error && (
        <p className="text-sm text-destructive">
          No se ha podido consultar la facturación.
        </p>
      )}

      {billing && (
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">
            {billing.orderCount} pedido(s), sin contar los cancelados
          </p>
          <p className="text-3xl font-bold">
            {priceFormatter.format(billing.total)}
          </p>
        </div>
      )}
    </main>
  );
}
