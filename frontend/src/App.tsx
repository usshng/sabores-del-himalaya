import type { ComponentType } from "react";
import ActivatePage from "@/pages/ActivatePage";
import LoginPage from "@/pages/LoginPage";
import MenuPage from "@/pages/MenuPage";
import RegisterPage from "@/pages/RegisterPage";
import StaffHomePage from "@/pages/StaffHomePage";
import OwnerMenuPage from "@/pages/OwnerMenuPage";
import ProductFormPage from "@/pages/ProductFormPage";
import OrderPage from "@/pages/OrderPage";
import StaffOrdersPage from "@/pages/StaffOrdersPage";

// Minimal routing by URL until the team adds a router.
const PAGES: Record<string, ComponentType> = {
  "/register": RegisterPage,
  "/activate": ActivatePage,
  "/login": LoginPage,
  "/staff": StaffHomePage,
  "/owner/menu": OwnerMenuPage,
  "/owner/products/new": ProductFormPage,
  "/order": OrderPage,
  "/staff/orders": StaffOrdersPage,
};

export default function App() {
  const Page = PAGES[window.location.pathname] ?? MenuPage;
  return <Page />;
}
