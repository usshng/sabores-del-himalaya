import { navigate } from "@/lib/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, X } from "lucide-react";
import {
  login,
  type AuthenticatedUser,
  type LoginError,
  type Role,
} from "@/api/authApi";

// Where staff land after logging in (US-10). Customers stay on the menu.
const STAFF_HOME_BY_ROLE: Record<Exclude<Role, "CUSTOMER">, string> = {
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

interface LoginDialogProps {
  onClose: () => void;
  onCustomerLoggedIn: (user: AuthenticatedUser) => void;
}

// P5 (and its error P5b): login as a dialog over the menu, as in the screen flow (ESQ).
export default function LoginDialog({
  onClose,
  onCustomerLoggedIn,
}: LoginDialogProps) {
  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<LoginError | null>(null);
  const [sending, setSending] = useState(false);

  // Closes the dialog with the Escape key.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    login(userLogin, password)
      .then((user) => {
        if (user.role === "CUSTOMER") {
          onCustomerLoggedIn(user);
          return;
        }
        navigate(STAFF_HOME_BY_ROLE[user.role]);
      })
      .catch((reason: Error) => {
        setError(reason.message as LoginError);
        setSending(false);
      });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative w-full max-w-md bg-neutral-950 px-10 py-10 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 text-neutral-400 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <h2 id="login-title" className="text-center text-3xl font-semibold">
          Iniciar sesión
        </h2>
        <p className="mb-8 mt-2 text-center text-sm">
          ¿Usuario nuevo?{" "}
          <a
            href="/register"
            className="inline-flex items-center gap-1 font-bold hover:underline"
          >
            Regístrate <ArrowRight className="size-4" />
          </a>
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-2 text-sm">
            Usuario
            <input
              required
              autoFocus
              value={userLogin}
              onChange={(event) => setUserLogin(event.target.value)}
              className="bg-neutral-200 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-white"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="bg-neutral-200 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-white"
            />
          </label>
          {error && <p className="text-sm text-red-400">{ERROR_TEXT[error]}</p>}
          <button
            type="submit"
            disabled={sending}
            className="mt-4 bg-neutral-200 py-2 font-medium text-black hover:bg-white disabled:opacity-50"
          >
            {sending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
