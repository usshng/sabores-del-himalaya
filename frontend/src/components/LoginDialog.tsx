import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
  X,
} from "lucide-react";
import {
  login,
  type AuthenticatedUser,
  type LoginError,
  type Role,
} from "@/api/authApi";
import { navigate } from "@/lib/navigation";

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

const fieldClass =
  "w-full rounded-md bg-neutral-200 py-2.5 pl-10 pr-3 text-black outline-none transition focus:bg-white focus:ring-2 focus:ring-white";

// P5 (and its error P5b): login as a dialog over the menu, as in the screen flow (ESQ).
export default function LoginDialog({
  onClose,
  onCustomerLoggedIn,
}: LoginDialogProps) {
  const [userLogin, setUserLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative w-full max-w-md rounded-xl bg-neutral-950 px-8 py-10 text-white shadow-2xl duration-200 animate-in fade-in zoom-in-95 sm:px-10"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 rounded-full p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <p className="mb-1 text-center text-xs uppercase tracking-widest text-neutral-500">
          Sabor del Himalaya
        </p>
        <h2 id="login-title" className="text-center text-3xl font-semibold">
          Iniciar sesión
        </h2>
        <p className="mb-8 mt-2 text-center text-sm text-neutral-400">
          ¿Usuario nuevo?{" "}
          <a
            href="/register"
            className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
          >
            Regístrate <ArrowRight className="size-4" />
          </a>
        </p>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="grid gap-1.5 text-sm text-neutral-300">
            Usuario
            <span className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <input
                required
                autoFocus
                autoComplete="username"
                value={userLogin}
                onChange={(event) => setUserLogin(event.target.value)}
                className={fieldClass}
              />
            </span>
          </label>

          <label className="grid gap-1.5 text-sm text-neutral-300">
            Contraseña
            <span className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`${fieldClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </span>
          </label>

          {error && (
            <p className="flex items-start gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-300 duration-200 animate-in fade-in">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              {ERROR_TEXT[error]}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-white py-2.5 font-medium text-black transition hover:bg-neutral-200 active:scale-[0.98] disabled:opacity-50"
          >
            {sending ? "Entrando…" : "Entrar"}
            {!sending && <ArrowRight className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
