import { useEffect, useRef, useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { getTodayMenu, type DailyMenu } from "@/api/dailyMenuApi";
import {
  getMyOrder,
  modifyOrder,
  type ModifyOrderError,
  type NewOrderMenu,
  type OrderMenu,
  type PlacedOrder,
} from "@/api/orderApi";
import { getMenu, type Product } from "@/api/productApi";

interface ModifyOrderDialogProps {
  orderId: number;
  onClose: () => void;
  onSaved: (order: PlacedOrder) => void;
}

interface Line {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
}

// A new menu has no id until it is saved, so we give it a key and a text to show it in the list.
interface NewMenu extends NewOrderMenu {
  key: number;
  label: string;
}

// The price of the daily menu is fixed (US-05). The server calculates the real total when saving.
const MENU_PRICE = 15;

const ERROR_MESSAGE: Record<ModifyOrderError, string> = {
  PERIOD_EXPIRED:
    "Ya han pasado los 10 minutos: el pedido no se puede modificar.",
  EMPTY: "El pedido no puede quedar vacío. Si no quieres nada, cancélalo.",
  NOT_AVAILABLE: "Algún producto o el menú del día ya no está disponible.",
  UNKNOWN: "No se ha podido guardar el pedido. Inténtalo de nuevo.",
};

const priceFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

// P6b: the customer modifies a placed order within 10 minutes (US-15). The changes are only saved
// when the customer clicks "Guardar cambios", all together.
export default function ModifyOrderDialog({
  orderId,
  onClose,
  onSaved,
}: ModifyOrderDialogProps) {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [keptMenus, setKeptMenus] = useState<OrderMenu[]>([]);
  const [newMenus, setNewMenus] = useState<NewMenu[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [todayMenu, setTodayMenu] = useState<DailyMenu | null>(null);
  const [productToAdd, setProductToAdd] = useState("");
  const [starterId, setStarterId] = useState("");
  const [mainCourseId, setMainCourseId] = useState("");
  const [dessertId, setDessertId] = useState("");
  const [error, setError] = useState<ModifyOrderError | null>(null);
  const [saving, setSaving] = useState(false);
  const nextKey = useRef(0);

  useEffect(() => {
    Promise.all([getMyOrder(orderId), getMenu(), getTodayMenu()])
      .then(([order, menuProducts, menu]) => {
        setLines(
          order.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        );
        setKeptMenus(order.menus);
        setProducts(menuProducts);
        setTodayMenu(menu);
        setLoaded(true);
      })
      .catch(() => setLoadError(true));
  }, [orderId]);

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

  function changeQuantity(productId: number, change: number) {
    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.max(1, line.quantity + change) }
          : line,
      ),
    );
  }

  function removeLine(productId: number) {
    setLines((current) =>
      current.filter((line) => line.productId !== productId),
    );
  }

  function addProduct() {
    const product = products.find(
      (option) => option.id === Number(productToAdd),
    );
    if (!product) {
      return;
    }
    setLines((current) => [
      ...current,
      {
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: 1,
      },
    ]);
    setProductToAdd("");
  }

  function addMenu() {
    if (!todayMenu || !starterId || !mainCourseId || !dessertId) {
      return;
    }
    const names = [
      todayMenu.starters.find((dish) => dish.id === Number(starterId)),
      todayMenu.mainCourses.find((dish) => dish.id === Number(mainCourseId)),
      todayMenu.desserts.find((dish) => dish.id === Number(dessertId)),
      todayMenu.drink,
    ].map((dish) => dish?.name);
    nextKey.current += 1;
    setNewMenus((current) => [
      ...current,
      {
        key: nextKey.current,
        starterId: Number(starterId),
        mainCourseId: Number(mainCourseId),
        dessertId: Number(dessertId),
        label: names.join(" · "),
      },
    ]);
    setStarterId("");
    setMainCourseId("");
    setDessertId("");
  }

  function handleSave() {
    setError(null);
    setSaving(true);
    modifyOrder(orderId, {
      items: lines.map(({ productId, quantity }) => ({ productId, quantity })),
      keptMenuIds: keptMenus.map((menu) => menu.id),
      newMenus: newMenus.map(({ starterId, mainCourseId, dessertId }) => ({
        starterId,
        mainCourseId,
        dessertId,
      })),
    })
      .then(onSaved)
      .catch((cause: Error) => {
        setError(cause.message as ModifyOrderError);
        setSaving(false);
      });
  }

  const menuCount = keptMenus.length + newMenus.length;
  const empty = lines.length === 0 && menuCount === 0;
  const total =
    lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0) +
    menuCount * MENU_PRICE;
  const productsToAdd = products.filter(
    (product) => !lines.some((line) => line.productId === product.id),
  );

  const selectClass =
    "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 duration-200 animate-in fade-in"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modify-order-title"
        className="relative max-h-[90svh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl duration-200 animate-in fade-in zoom-in-95 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 text-neutral-400 hover:text-black"
        >
          <X className="size-5" />
        </button>

        <h2 id="modify-order-title" className="mb-1 text-2xl font-semibold">
          Modificar pedido #{orderId}
        </h2>
        <p className="mb-6 text-sm text-neutral-500">
          Puedes cambiarlo sin coste durante los 10 minutos siguientes a
          hacerlo.
        </p>

        {loadError && (
          <p className="text-destructive">
            No se ha podido cargar el pedido. Inténtalo de nuevo más tarde.
          </p>
        )}

        {!loaded && !loadError && (
          <p className="text-neutral-600">Cargando el pedido…</p>
        )}

        {loaded && (
          <>
            <ul className="mb-6 grid gap-2">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3"
                >
                  <div className="mr-auto">
                    <p className="font-medium">{line.name}</p>
                    <p className="text-sm text-neutral-500">
                      {priceFormatter.format(line.unitPrice)} / unidad
                    </p>
                  </div>
                  <div className="flex h-9 items-center rounded-full border border-neutral-300">
                    <button
                      onClick={() => changeQuantity(line.productId, -1)}
                      aria-label="Quitar uno"
                      className="flex h-full w-8 items-center justify-center rounded-l-full text-neutral-500 hover:bg-neutral-100 hover:text-black"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-medium tabular-nums">
                      {line.quantity}
                    </span>
                    <button
                      onClick={() => changeQuantity(line.productId, 1)}
                      aria-label="Añadir uno"
                      className="flex h-full w-8 items-center justify-center rounded-r-full text-neutral-500 hover:bg-neutral-100 hover:text-black"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="w-20 text-right font-semibold tabular-nums">
                    {priceFormatter.format(line.unitPrice * line.quantity)}
                  </span>
                  <button
                    onClick={() => removeLine(line.productId)}
                    aria-label={`Quitar ${line.name}`}
                    className="text-neutral-400 hover:text-black"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
              {keptMenus.map((menu) => (
                <MenuLine
                  key={`kept-${menu.id}`}
                  label={`${menu.starter} · ${menu.mainCourse} · ${menu.dessert} · ${menu.drink}`}
                  onRemove={() =>
                    setKeptMenus((current) =>
                      current.filter((kept) => kept.id !== menu.id),
                    )
                  }
                />
              ))}
              {newMenus.map((menu) => (
                <MenuLine
                  key={`new-${menu.key}`}
                  label={menu.label}
                  onRemove={() =>
                    setNewMenus((current) =>
                      current.filter((added) => added.key !== menu.key),
                    )
                  }
                />
              ))}
            </ul>

            {empty && (
              <p className="mb-6 rounded-md bg-neutral-100 px-4 py-3 text-sm text-neutral-600">
                El pedido está vacío. Si no quieres nada, cierra esta ventana y
                cancélalo.
              </p>
            )}

            <section className="mb-6 border-t border-neutral-200 pt-4">
              <h3 className="mb-2 text-sm font-semibold">
                Añadir un producto de la carta
              </h3>
              <div className="flex gap-2">
                <select
                  value={productToAdd}
                  onChange={(event) => setProductToAdd(event.target.value)}
                  className={selectClass}
                >
                  <option value="">Elige un producto…</option>
                  {productsToAdd.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} · {priceFormatter.format(product.price)}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addProduct}
                  disabled={!productToAdd}
                  className="rounded-md bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
                >
                  Añadir
                </button>
              </div>
            </section>

            <section className="mb-6 border-t border-neutral-200 pt-4">
              <h3 className="mb-2 text-sm font-semibold">
                Añadir un menú del día ({priceFormatter.format(MENU_PRICE)})
              </h3>
              {todayMenu ? (
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                  <select
                    value={starterId}
                    onChange={(event) => setStarterId(event.target.value)}
                    aria-label="Primero"
                    className={selectClass}
                  >
                    <option value="">Primero…</option>
                    {todayMenu.starters.map((dish) => (
                      <option key={dish.id} value={dish.id}>
                        {dish.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={mainCourseId}
                    onChange={(event) => setMainCourseId(event.target.value)}
                    aria-label="Segundo"
                    className={selectClass}
                  >
                    <option value="">Segundo…</option>
                    {todayMenu.mainCourses.map((dish) => (
                      <option key={dish.id} value={dish.id}>
                        {dish.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={dessertId}
                    onChange={(event) => setDessertId(event.target.value)}
                    aria-label="Postre"
                    className={selectClass}
                  >
                    <option value="">Postre…</option>
                    {todayMenu.desserts.map((dish) => (
                      <option key={dish.id} value={dish.id}>
                        {dish.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addMenu}
                    disabled={!starterId || !mainCourseId || !dessertId}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-40"
                  >
                    Añadir
                  </button>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">
                  Menú del día no disponible.
                </p>
              )}
            </section>

            <footer className="flex flex-wrap items-center justify-end gap-4 border-t border-black pt-4">
              <span className="mr-auto text-neutral-600">
                Nuevo importe total
              </span>
              <span className="text-2xl font-semibold tabular-nums">
                {priceFormatter.format(total)}
              </span>
              <button
                onClick={handleSave}
                disabled={saving || empty}
                className="rounded-full bg-black px-6 py-2.5 font-medium text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-40"
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </footer>
            {error && (
              <p className="mt-3 text-right text-sm text-destructive">
                {ERROR_MESSAGE[error] ?? ERROR_MESSAGE.UNKNOWN}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MenuLine({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 px-4 py-3">
      <div className="mr-auto">
        <p className="font-medium">Menú del día</p>
        <p className="text-sm text-neutral-500">{label}</p>
      </div>
      <span className="w-20 text-right font-semibold tabular-nums">
        {priceFormatter.format(MENU_PRICE)}
      </span>
      <button
        onClick={onRemove}
        aria-label="Quitar menú"
        className="text-neutral-400 hover:text-black"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
