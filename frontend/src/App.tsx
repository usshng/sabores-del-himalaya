import ActivatePage from "@/pages/ActivatePage";
import MenuPage from "@/pages/MenuPage";
import RegisterPage from "@/pages/RegisterPage";

// Minimal routing by URL until the team adds a router.
export default function App() {
  if (window.location.pathname === "/register") {
    return <RegisterPage />;
  }
  if (window.location.pathname === "/activate") {
    return <ActivatePage />;
  }
  return <MenuPage />;
}
