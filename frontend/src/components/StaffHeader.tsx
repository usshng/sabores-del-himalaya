import { logout } from "@/api/authApi";
import { navigate } from "@/lib/navigation";

interface StaffLink {
  href: string;
  label: string;
}

interface StaffHeaderProps {
  panelLabel: string;
  links: StaffLink[];
}

// Black header of the restaurant screens (staff and owner), as in the screen flow (ESQ).
export default function StaffHeader({ panelLabel, links }: StaffHeaderProps) {
  const currentPath = window.location.pathname;

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-black px-6 py-5 text-white">
      <span className="text-sm text-neutral-400">{panelLabel}</span>
      <span className="text-center text-xl font-semibold md:text-2xl">
        Sabor del Himalaya
      </span>
      <nav className="flex flex-wrap justify-end gap-x-6 gap-y-1 text-sm">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`hover:underline ${
              currentPath === link.href ? "underline underline-offset-4" : ""
            }`}
          >
            {link.label}
          </a>
        ))}
        <button
          onClick={() => logout().then(() => navigate("/"))}
          className="text-neutral-400 hover:text-white hover:underline"
        >
          Cerrar sesión
        </button>
      </nav>
    </header>
  );
}
