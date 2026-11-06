import { useEffect, useState } from "react";
import { activateAccount } from "@/api/customerApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ActivationState = "activating" | "activated" | "invalid";

export default function ActivatePage() {
  const [state, setState] = useState<ActivationState>("activating");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("invalid");
      return;
    }
    activateAccount(token)
      .then(() => setState("activated"))
      .catch(() => setState("invalid"));
  }, []);

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            {state === "activating" && "Activando tu cuenta…"}
            {state === "activated" && "Cuenta activada"}
            {state === "invalid" && "Enlace no válido"}
          </CardTitle>
          <CardDescription>
            {state === "activated" &&
              "Ya puedes iniciar sesión y hacer pedidos."}
            {state === "invalid" &&
              "El enlace de activación no es válido o ya se ha usado."}
          </CardDescription>
        </CardHeader>
        {state !== "activating" && (
          <CardContent>
            <a
              href={state === "activated" ? "/login" : "/"}
              className="font-medium underline"
            >
              {state === "activated" ? "Iniciar sesión" : "Volver a la carta"}
            </a>
          </CardContent>
        )}
      </Card>
    </main>
  );
}
