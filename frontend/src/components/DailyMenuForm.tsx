import { useState, type FormEvent } from "react";
import { CircleCheck } from "lucide-react";
import {
  createDailyMenu,
  type DailyMenu,
  type DailyMenuError,
} from "@/api/dailyMenuApi";
import {
  MENU_USE_LABEL,
  type MenuCourse,
  type MenuDishOption,
} from "@/api/menuDishApi";
import { CATEGORY_LABEL } from "@/api/productApi";

const ERROR_TEXT: Record<DailyMenuError, string> = {
  ALREADY_EXISTS: "Ese día ya tiene un menú configurado.",
  INVALID: "Revisa los platos: no se pueden repetir y cada uno va en su parte.",
  UNKNOWN: "No se ha podido guardar el menú. Inténtalo más tarde.",
};

// How many options each part of the menu has (US-05), the same as in DailyMenu in the backend.
const SECTIONS: { course: MenuCourse; title: string; size: number }[] = [
  { course: "STARTER", title: "Entrantes", size: 3 },
  { course: "MAIN_COURSE", title: "Platos principales", size: 3 },
  { course: "DESSERT", title: "Postres", size: 2 },
  { course: "DRINK", title: "Bebida", size: 1 },
];

const EMPTY_CHOICES: Record<MenuCourse, string[]> = {
  STARTER: ["", "", ""],
  MAIN_COURSE: ["", "", ""],
  DESSERT: ["", ""],
  DRINK: [""],
};

// Shows the category for products of the menu, or the use for dishes only for menus (US-05).
function optionLabel(dish: MenuDishOption): string {
  if (dish.category) {
    return `${dish.name} · ${CATEGORY_LABEL[dish.category]}`;
  }
  const use = dish.menuUse ? MENU_USE_LABEL[dish.menuUse] : "";
  return `${dish.name} · Plato para menús (${use})`;
}

function today(): string {
  return new Intl.DateTimeFormat("en-CA").format(new Date());
}

interface DailyMenuFormProps {
  options: MenuDishOption[];
}

// P11: the chef configures the menu of a day with its dishes (US-05). The price is always 15 €.
export default function DailyMenuForm({ options }: DailyMenuFormProps) {
  const [date, setDate] = useState(today);
  const [choices, setChoices] = useState(EMPTY_CHOICES);
  const [error, setError] = useState<DailyMenuError | null>(null);
  const [sending, setSending] = useState(false);
  const [saved, setSaved] = useState<DailyMenu | null>(null);

  function choose(course: MenuCourse, index: number, value: string) {
    setChoices((current) => ({
      ...current,
      [course]: current[course].map((old, i) => (i === index ? value : old)),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError(null);
    const ids = (course: MenuCourse) => choices[course].map(Number);
    createDailyMenu({
      date,
      starterIds: ids("STARTER"),
      mainCourseIds: ids("MAIN_COURSE"),
      dessertIds: ids("DESSERT"),
      drinkId: ids("DRINK")[0],
    })
      .then((menu) => {
        setSaved(menu);
        setChoices(EMPTY_CHOICES);
      })
      .catch((reason: Error) => setError(reason.message as DailyMenuError))
      .finally(() => setSending(false));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-xl bg-white p-6 shadow-sm"
    >
      {saved && (
        <p className="flex items-center gap-2 rounded-md bg-neutral-100 px-4 py-3 text-sm duration-300 animate-in fade-in">
          <CircleCheck className="size-5" />
          Menú del {saved.date} guardado por{" "}
          {new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
          }).format(saved.price)}
          .
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="grid gap-1 text-sm">
          Día del menú
          <input
            type="date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-md border border-neutral-400 px-3 py-2"
          />
        </label>
        <p className="text-sm text-neutral-500">Precio fijo: 15,00 €</p>
      </div>

      {SECTIONS.map((section) => {
        const available = options.filter(
          (dish) => dish.course === section.course,
        );
        return (
          <fieldset key={section.course} className="grid gap-2">
            <legend className="mb-1 font-semibold">{section.title}</legend>
            {choices[section.course].map((value, index) => (
              <select
                key={index}
                required
                value={value}
                onChange={(event) =>
                  choose(section.course, index, event.target.value)
                }
                className="rounded-md border border-neutral-400 bg-white px-3 py-2 text-sm"
              >
                <option value="">Elige un plato…</option>
                {available.map((dish) => (
                  <option
                    key={dish.id}
                    value={dish.id}
                    // A dish already chosen in this part can't be chosen again (US-05).
                    disabled={
                      choices[section.course].includes(String(dish.id)) &&
                      value !== String(dish.id)
                    }
                  >
                    {optionLabel(dish)}
                  </option>
                ))}
              </select>
            ))}
          </fieldset>
        );
      })}

      {error && <p className="text-sm text-destructive">{ERROR_TEXT[error]}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-black px-6 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {sending ? "Guardando…" : "Guardar menú"}
        </button>
      </div>
    </form>
  );
}
