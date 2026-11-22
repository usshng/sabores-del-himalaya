import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import {
  createMenuDish,
  MENU_USE_LABEL,
  type MenuDish,
  type MenuUse,
} from "@/api/menuDishApi";

const MENU_USES: MenuUse[] = ["STARTER", "MAIN_COURSE", "DESSERT"];

interface MenuDishDialogProps {
  onClose: () => void;
  onSaved: (dish: MenuDish) => void;
}

// P12: form to register a dish only for daily menus (US-06). It has no price or category,
// because these dishes are never sold alone: they are only used inside a daily menu.
export default function MenuDishDialog({
  onClose,
  onSaved,
}: MenuDishDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [menuUse, setMenuUse] = useState<MenuUse>("STARTER");
  const [error, setError] = useState(false);
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
    setError(false);
    createMenuDish({ name, description, menuUse })
      .then(onSaved)
      .catch(() => {
        setError(true);
        setSending(false);
      });
  }

  const fieldClass =
    "w-full rounded-md bg-neutral-200 px-3 py-2 text-black outline-none focus:ring-2 focus:ring-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-dish-title"
        className="relative w-full max-w-lg rounded-xl bg-neutral-950 px-8 py-8 text-white shadow-2xl duration-200 animate-in fade-in zoom-in-95 sm:px-10"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-5 top-5 text-neutral-400 hover:text-white"
        >
          <X className="size-5" />
        </button>

        <h2
          id="menu-dish-title"
          className="mb-1 text-center text-2xl font-semibold"
        >
          Nuevo plato para menús
        </h2>
        <p className="mb-6 text-center text-sm text-neutral-400">
          No aparecerá en la carta: solo se usa en los menús diarios.
        </p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-1.5 text-sm">
            Nombre
            <input
              required
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            Descripción
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={`${fieldClass} resize-none`}
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            Tipo de uso en el menú
            <select
              value={menuUse}
              onChange={(event) => setMenuUse(event.target.value as MenuUse)}
              className={fieldClass}
            >
              {MENU_USES.map((option) => (
                <option key={option} value={option}>
                  {MENU_USE_LABEL[option]}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p className="text-sm text-red-400">
              No se ha podido guardar el plato. Revisa los datos.
            </p>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white px-5 py-2 text-sm font-medium hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={sending}
              className="rounded-md bg-neutral-200 px-5 py-2 text-sm font-medium text-black hover:bg-white disabled:opacity-50"
            >
              {sending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
