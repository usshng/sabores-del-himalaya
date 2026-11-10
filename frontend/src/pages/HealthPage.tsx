import { useEffect, useState } from "react";
import { getHealth, type ComponentStatus, type Health } from "@/api/healthApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DisplayStatus = ComponentStatus | "CHECKING" | "UNKNOWN";

type HealthState =
  { kind: "loading" } | { kind: "loaded"; health: Health } | { kind: "error" };

const STATUS_TEXT: Record<DisplayStatus, string> = {
  UP: "Funciona",
  DOWN: "No responde",
  CHECKING: "Comprobando…",
  UNKNOWN: "Desconocido",
};

const STATUS_COLOR: Record<DisplayStatus, string> = {
  UP: "text-green-600",
  DOWN: "text-destructive",
  CHECKING: "text-muted-foreground",
  UNKNOWN: "text-muted-foreground",
};

function toDisplayStatuses(state: HealthState): {
  backend: DisplayStatus;
  database: DisplayStatus;
} {
  switch (state.kind) {
    case "loading":
      return { backend: "CHECKING", database: "CHECKING" };
    case "loaded":
      return state.health;
    case "error":
      return { backend: "DOWN", database: "UNKNOWN" };
  }
}

export default function HealthPage() {
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  useEffect(() => {
    getHealth()
      .then((health) => setState({ kind: "loaded", health }))
      .catch(() => setState({ kind: "error" }));
  }, []);

  const statuses = toDisplayStatuses(state);
  const rows = [
    { label: "Backend", status: statuses.backend },
    { label: "Base de datos", status: statuses.database },
  ];

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Estado del sistema</CardTitle>
          <CardDescription>
            Comprueba que el frontend llega al backend y a la base de datos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-y-2">
            {rows.map(({ label, status }) => (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd
                  className={`text-right font-medium ${STATUS_COLOR[status]}`}
                >
                  {STATUS_TEXT[status]}
                </dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </main>
  );
}
