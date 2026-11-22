import { useEffect, useState } from "react";
import { CircleCheck, Plus } from "lucide-react";
import { getCurrentUser } from "@/api/authApi";
import type { MenuDish } from "@/api/menuDishApi";
import MenuDishDialog from "@/components/MenuDishDialog";
import StaffHeader from "@/components/StaffHeader";
import { navigate } from "@/lib/navigation";

const CHEF_LINKS = [{ href: "/chef", label: "Menú diario" }];

// Chef panel. For now it registers dishes for daily menus (US-06);
// the configuration of the daily menu (P11, US-05) is added in its own story.
export default function ChefPage() {
  const [ready, setReady] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [lastDish, setLastDish] = useState<MenuDish | null>(null);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user?.role !== "CHEF") {
        navigate("/login");
        return;
      }
      setReady(true);
    });
  }, []);

  function handleSaved(dish: MenuDish) {
    setLastDish(dish);
    setShowDialog(false);
  }

  if (!ready) {
    return null;
  }

  return (
    <div className="flex min-h-svh flex-col bg-neutral-200">
      <StaffHeader panelLabel="Panel del chef" links={CHEF_LINKS} />

      <div className="flex items-center justify-between bg-white px-6 py-4">
        <h1 className="text-lg font-medium">Menú diario</h1>
        <button
          onClick={() => setShowDialog(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          <Plus className="size-4" />
          Nuevo plato para menús
        </button>
      </div>

      <main className="mx-auto w-full max-w-3xl flex-1 p-6">
        {lastDish && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-white px-5 py-4 shadow-sm duration-300 animate-in fade-in">
            <CircleCheck className="size-5" />
            Plato «{lastDish.name}» guardado. Ya puedes usarlo en los menús
            diarios.
          </p>
        )}
        <div className="rounded-xl bg-white p-8 text-center text-neutral-600 shadow-sm">
          Aquí podrás configurar el menú de cada día.
        </div>
      </main>

      {showDialog && (
        <MenuDishDialog
          onClose={() => setShowDialog(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
