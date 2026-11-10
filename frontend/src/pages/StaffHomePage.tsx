import { navigate } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout, type AuthenticatedUser } from "@/api/authApi";

const ROLE_LABEL: Record<string, string> = {
  OWNER: "dueño",
  CHEF: "chef",
  STAFF: "personal del restaurante",
};

export default function StaffHomePage() {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    getCurrentUser().then((current) => {
      if (!current) {
        navigate("/login");
        return;
      }
      setUser(current);
    });
  }, []);

  if (!user) {
    return null;
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">Panel del restaurante</h1>
      <p className="mb-6 text-muted-foreground">
        Has iniciado sesión como {ROLE_LABEL[user.role]} ({user.login}).
      </p>
      <button
        onClick={() => logout().then(() => navigate("/"))}
        className="underline"
      >
        Cerrar sesión
      </button>
    </main>
  );
}
