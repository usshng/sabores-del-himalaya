import { useState, type FormEvent } from "react";
import { login, type LoginError, type Role } from "@/api/authApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Where each role lands after logging in (US-10). Staff screens arrive with their own user stories.
const HOME_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "/carta",
  OWNER: "/owner/menu",
  CHEF: "/staff",
  STAFF: "/staff/orders",
};

const ERROR_TEXT: Record<LoginError, string> = {
  INVALID_CREDENTIALS: "Usuario o contraseña no válidos.",
  NOT_ACTIVATED:
    "Tu cuenta aún no está activada. Abre el enlace que te enviamos por correo.",
  UNKNOWN: "No se ha podido iniciar sesión. Inténtalo más tarde.",
};

export default function LoginPage() {
  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError | null>(null);
  const [sending, setSending] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    login(userLogin, password)
      .then((user) => {
        window.location.href = HOME_BY_ROLE[user.role];
      })
      .catch((reason: Error) => {
        setError(reason.message as LoginError);
        setSending(false);
      });
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
          <CardDescription>Entra con tu usuario y contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3">
            <label className="grid gap-1 text-sm">
              Usuario
              <input
                required
                value={userLogin}
                onChange={(event) => setUserLogin(event.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              Contraseña
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-md border px-3 py-2"
              />
            </label>
            {error && (
              <p className="text-sm text-destructive">{ERROR_TEXT[error]}</p>
            )}
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground disabled:opacity-50"
            >
              {sending ? "Entrando…" : "Entrar"}
            </button>
          </form>
          <p className="mt-4 text-sm">
            ¿No tienes cuenta?{" "}
            <a href="/register" className="underline">
              Regístrate
            </a>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
