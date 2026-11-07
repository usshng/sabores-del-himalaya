import { useEffect, useState, type ComponentType } from "react";
import { flushSync } from "react-dom";
import ActivatePage from "@/pages/ActivatePage";
import BillingPage from "@/pages/BillingPage";
import MenuPage from "@/pages/MenuPage";
import MyOrdersPage from "@/pages/MyOrdersPage";
import OrderPage from "@/pages/OrderPage";
import OwnerMenuPage from "@/pages/OwnerMenuPage";
import StaffHomePage from "@/pages/StaffHomePage";
import StaffOrdersPage from "@/pages/StaffOrdersPage";
import WelcomePage from "@/pages/WelcomePage";

// Minimal routing by URL until the team adds a router.
const PAGES: Record<string, ComponentType> = {
  "/": WelcomePage,
  "/carta": MenuPage,
  // Login is a dialog over the menu (P5 over P1).
  "/login": MenuPage,
  // Registration is a dialog over the menu (P3 over P1).
  "/register": MenuPage,
  "/activate": ActivatePage,
  "/order": OrderPage,
  "/my-orders": MyOrdersPage,
  "/staff": StaffHomePage,
  "/staff/orders": StaffOrdersPage,
  "/owner/menu": OwnerMenuPage,
  // The product form is a dialog over the menu management (P9 over P8).
  "/owner/products/new": OwnerMenuPage,
  "/owner/products/edit": OwnerMenuPage,
  "/owner/billing": BillingPage,
};

// Pages that open dialogs keep one key for all their addresses, so opening a dialog does not reset them.
const SHARED_KEYS = new Map<ComponentType, string>([
  [MenuPage, "menu"],
  [OwnerMenuPage, "owner-menu"],
]);

function currentLocation(): string {
  return window.location.pathname + window.location.search;
}

// Shows the new page inside a view transition when the browser supports it, so pages change smoothly.
function showWithTransition(update: () => void) {
  if (!document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(() => flushSync(update));
}

export default function App() {
  const [location, setLocation] = useState(currentLocation);

  useEffect(() => {
    // Internal links change the page without reloading it.
    function handleClick(event: MouseEvent) {
      const link = (event.target as Element).closest("a");
      if (
        !link ||
        link.target ||
        link.origin !== window.location.origin ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      event.preventDefault();
      const next = link.pathname + link.search;
      window.history.pushState(null, "", next);
      showWithTransition(() => setLocation(next));
    }

    // The browser's back and forward buttons show the page of the address.
    function handlePopState() {
      showWithTransition(() => setLocation(currentLocation()));
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const pathname = location.split("?")[0];
  const Page = PAGES[pathname] ?? WelcomePage;
  const pageKey = SHARED_KEYS.get(Page) ?? location;
  return <Page key={pageKey} />;
}
