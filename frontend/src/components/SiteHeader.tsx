import { navigate } from "@/lib/navigation";
import { logout, type AuthenticatedUser } from "@/api/authApi";

interface SiteHeaderProps {
  user: AuthenticatedUser | null;
  orderUnits?: number;
  backHref?: string;
  // When given, "Iniciar sesión" opens the login dialog on the same page instead of navigating.
  onLogin?: () => void;
}

// Black header of the customer screens, as in the screen flow (ESQ): back link, name and session links.
export default function SiteHeader({
  user,
  orderUnits,
  backHref = "/",
  onLogin,
}: SiteHeaderProps) {
  const isCustomer = user?.role === "CUSTOMER";

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-black px-6 py-5 text-white">
      <a href={backHref} className="text-sm hover:underline">
        Volver
      </a>
      {/* Same transition name as the welcome title (P0), so the name travels between both pages. */}
      <a
        href="/"
        className="text-center text-xl font-semibold md:text-2xl"
        style={{ viewTransitionName: "brand" }}
      >
        Sabor del Himalaya
      </a>
      <nav className="flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm">
        {isCustomer && (
          <a href="/order" className="hover:underline">
            Pedido actual ({orderUnits ?? 0})
          </a>
        )}

        {/* Visitors need to log in to have an order (US-10): on the menu this opens the login dialog. */}
        {!user &&
          (onLogin ? (
            <button onClick={onLogin} className="hover:underline">
              Pedido actual
            </button>
          ) : (
            <a href="/login" className="hover:underline">
              Pedido actual
            </a>
          ))}
        {isCustomer && (
          <a href="/my-orders" className="hover:underline">
            Mis pedidos
          </a>
        )}
        {user ? (
          <button
            onClick={() => logout().then(() => navigate("/"))}
            className="hover:underline"
          >
            Cerrar sesión
          </button>
        ) : onLogin ? (
          <button onClick={onLogin} className="hover:underline">
            Iniciar sesión
          </button>
        ) : (
          <a href="/login" className="hover:underline">
            Iniciar sesión
          </a>
        )}
      </nav>
    </header>
  );
}
