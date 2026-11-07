import { useEffect, useState, type FormEvent } from "react";
import { getCurrentUser } from "@/api/authApi";
import { getDailyBilling, type DailyBilling } from "@/api/billingApi";
import StaffHeader from "@/components/StaffHeader";
import { navigate } from "@/lib/navigation";

const OWNER_LINKS = [
  { href: "/owner/menu", label: "Carta" },
  { href: "/owner/billing", label: "Facturación" },
];

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

const longDate = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

// "en-CA" formats dates as YYYY-MM-DD in local time, the format the date input and the API use.
function isoDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA").format(date);
}

function today(): string {
  return isoDate(new Date());
}

// Reads YYYY-MM-DD as a local date, so the day shown is never shifted by the time zone.
function formatDay(day: string): string {
  return longDate.format(new Date(`${day}T00:00:00`));
}

// P10: daily billing for the owner (US-20). Today's billing is shown on arrival.
export default function BillingPage() {
  const [date, setDate] = useState(today);
  const [billing, setBilling] = useState<DailyBilling | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function consult(day: string) {
    setError(false);
    setLoading(true);
    getDailyBilling(day)
      .then(setBilling)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "OWNER") {
        navigate("/login");
        return;
      }
      consult(today());
    });
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    consult(date);
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <StaffHeader panelLabel="Panel del dueño" links={OWNER_LINKS} />

      <h1 className="bg-white py-4 text-center text-lg font-medium">
        Facturación diaria
      </h1>

      <main className="flex flex-1 items-start justify-center p-6 pt-12">
        <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit}>
            <label htmlFor="billing-day" className="mb-1 block text-sm">
              Día
            </label>
            <div className="flex gap-2">
              <input
                id="billing-day"
                type="date"
                required
                max={today()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="flex-1 rounded-md border border-neutral-400 px-3 py-2"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
              >
                Consultar
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-black pt-6">
            {error ? (
              <p className="text-sm text-destructive">
                No se ha podido consultar la facturación.
              </p>
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-4">
                  <span>Total facturado</span>
                  <span
                    className={`text-4xl font-bold tabular-nums transition-opacity ${
                      loading ? "opacity-40" : ""
                    }`}
                  >
                    {priceFormatter.format(billing?.total ?? 0)}
                  </span>
                </div>
                {billing && (
                  <p className="mt-3 text-sm text-neutral-500">
                    <span className="first-letter:uppercase">
                      {formatDay(billing.date)}
                    </span>{" "}
                    · {billing.orderCount}{" "}
                    {billing.orderCount === 1 ? "pedido" : "pedidos"}, sin
                    contar los cancelados
                  </p>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
