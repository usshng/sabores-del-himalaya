import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  AtSign,
  CircleAlert,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MailCheck,
  MapPin,
  UserRound,
  X,
} from "lucide-react";
import {
  registerCustomer,
  type RegisterCustomerRequest,
  type RegistrationError,
} from "@/api/customerApi";

const ERROR_TEXT: Record<RegistrationError, string> = {
  DUPLICATE: "El usuario o el correo ya están registrados.",
  INVALID:
    "Revisa los datos: todos son obligatorios y el correo debe ser válido.",
  UNKNOWN: "No se ha podido completar el registro. Inténtalo más tarde.",
};

const EMPTY_FORM: RegisterCustomerRequest = {
  name: "",
  address: "",
  login: "",
  password: "",
  email: "",
};

const fieldClass =
  "w-full rounded-md bg-neutral-200 py-2.5 pl-10 pr-3 text-black outline-none transition focus:bg-white focus:ring-2 focus:ring-white";

const iconClass =
  "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500";

interface RegisterDialogProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

// P3 (and its confirmation P3b): registration as a dialog over the menu, as in the screen flow (ESQ).
export default function RegisterDialog({
  onClose,
  onSwitchToLogin,
}: RegisterDialogProps) {
  const [form, setForm] = useState<RegisterCustomerRequest>(EMPTY_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<RegistrationError | null>(null);
  const [sending, setSending] = useState(false);
  const [registered, setRegistered] = useState(false);

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

  function update(field: keyof RegisterCustomerRequest, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    registerCustomer(form)
      .then(() => setRegistered(true))
      .catch((reason: Error) => {
        setError(reason.message as RegistrationError);
        setSending(false);
      });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-title"
        className="relative my-auto w-full max-w-md rounded-xl bg-neutral-950 px-8 py-10 text-white shadow-2xl duration-200 animate-in fade-in zoom-in-95 sm:px-10"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 rounded-full p-1 text-neutral-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="size-5" />
        </button>

        {registered ? (
          // P3b: activation email sent.
          <div className="text-center duration-200 animate-in fade-in">
            <MailCheck className="mx-auto mb-4 size-12" />
            <h2 id="register-title" className="text-2xl font-semibold">
              Revisa tu correo
            </h2>
            <p className="mt-3 text-sm text-neutral-400">
              Te hemos enviado un enlace de activación a{" "}
              <span className="font-semibold text-white">{form.email}</span>.
              Ábrelo para activar tu cuenta antes de iniciar sesión.
            </p>
            <button
              onClick={onClose}
              className="mt-8 w-full rounded-md bg-white py-2.5 font-medium text-black transition hover:bg-neutral-200"
            >
              Aceptar
            </button>
          </div>
        ) : (
          <>
            <p className="mb-1 text-center text-xs uppercase tracking-widest text-neutral-500">
              Sabor del Himalaya
            </p>
            <h2
              id="register-title"
              className="text-center text-3xl font-semibold"
            >
              Crear cuenta
            </h2>
            <p className="mb-8 mt-2 text-center text-sm text-neutral-400">
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
              >
                Inicia sesión <ArrowRight className="size-4" />
              </button>
            </p>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-1.5 text-sm text-neutral-300">
                Nombre
                <span className="relative">
                  <UserRound className={iconClass} />
                  <input
                    required
                    autoFocus
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    className={fieldClass}
                  />
                </span>
              </label>

              <label className="grid gap-1.5 text-sm text-neutral-300">
                Dirección
                <span className="relative">
                  <MapPin className={iconClass} />
                  <input
                    required
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                    className={fieldClass}
                  />
                </span>
              </label>

              <label className="grid gap-1.5 text-sm text-neutral-300">
                Usuario
                <span className="relative">
                  <AtSign className={iconClass} />
                  <input
                    required
                    autoComplete="username"
                    value={form.login}
                    onChange={(event) => update("login", event.target.value)}
                    className={fieldClass}
                  />
                </span>
              </label>

              <label className="grid gap-1.5 text-sm text-neutral-300">
                Contraseña
                <span className="relative">
                  <LockKeyhole className={iconClass} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(event) => update("password", event.target.value)}
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

              <label className="grid gap-1.5 text-sm text-neutral-300">
                Correo electrónico
                <span className="relative">
                  <Mail className={iconClass} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    className={fieldClass}
                  />
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
                {sending ? "Registrando…" : "Registrarse"}
                {!sending && <ArrowRight className="size-4" />}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
