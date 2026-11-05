import { useState, type FormEvent } from "react";
import {
  registerCustomer,
  type RegisterCustomerRequest,
  type RegistrationError,
} from "@/api/customerApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type RegisterState =
  | { kind: "editing" }
  | { kind: "sending" }
  | { kind: "error"; reason: RegistrationError }
  | { kind: "registered" };

const ERROR_TEXT: Record<RegistrationError, string> = {
  DUPLICATE: "El login o el correo ya están registrados.",
  INVALID:
    "Revisa los datos: todos son obligatorios y el correo debe ser válido.",
  UNKNOWN: "No se ha podido completar el registro. Inténtalo más tarde.",
};

const FIELDS: {
  name: keyof RegisterCustomerRequest;
  label: string;
  type: string;
}[] = [
  { name: "name", label: "Nombre", type: "text" },
  { name: "address", label: "Dirección", type: "text" },
  { name: "login", label: "Usuario", type: "text" },
  { name: "password", label: "Contraseña", type: "password" },
  { name: "email", label: "Correo electrónico", type: "email" },
];

const EMPTY_FORM: RegisterCustomerRequest = {
  name: "",
  address: "",
  login: "",
  password: "",
  email: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterCustomerRequest>(EMPTY_FORM);
  const [state, setState] = useState<RegisterState>({ kind: "editing" });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: "sending" });
    registerCustomer(form)
      .then(() => setState({ kind: "registered" }))
      .catch((error: Error) =>
        setState({ kind: "error", reason: error.message as RegistrationError }),
      );
  }

  // P3b: activation email sent.
  if (state.kind === "registered") {
    return (
      <main className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Correo de activación enviado</CardTitle>
            <CardDescription>
              Te hemos enviado un enlace a {form.email}. Ábrelo para activar tu
              cuenta antes de iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href="/" className="font-medium underline">
              Aceptar
            </a>
          </CardContent>
        </Card>
      </main>
    );
  }

  // P3: registration form.
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Registro</CardTitle>
          <CardDescription>Crea tu cuenta para hacer pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-3">
            {FIELDS.map((field) => (
              <label key={field.name} className="grid gap-1 text-sm">
                {field.label}
                <input
                  type={field.type}
                  required
                  value={form[field.name]}
                  onChange={(event) =>
                    setForm({ ...form, [field.name]: event.target.value })
                  }
                  className="rounded-md border px-3 py-2"
                />
              </label>
            ))}
            {state.kind === "error" && (
              <p className="text-sm text-destructive">
                {ERROR_TEXT[state.reason]}
              </p>
            )}
            <button
              type="submit"
              disabled={state.kind === "sending"}
              className="rounded-md bg-primary px-3 py-2 font-medium text-primary-foreground disabled:opacity-50"
            >
              {state.kind === "sending" ? "Registrando…" : "Registrarse"}
            </button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
