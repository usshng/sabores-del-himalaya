import type { ComponentType } from "react";
import ActivatePage from "@/pages/ActivatePage";
import BillingPage from "@/pages/BillingPage";
import LoginPage from "@/pages/LoginPage";
import MenuPage from "@/pages/MenuPage";
import MyOrdersPage from "@/pages/MyOrdersPage";
import OrderPage from "@/pages/OrderPage";
import OwnerMenuPage from "@/pages/OwnerMenuPage";
import ProductFormPage from "@/pages/ProductFormPage";
import RegisterPage from "@/pages/RegisterPage";
import StaffHomePage from "@/pages/StaffHomePage";
import StaffOrdersPage from "@/pages/StaffOrdersPage";
import WelcomePage from "@/pages/WelcomePage";

// Minimal routing by URL until the team adds a router.
const PAGES: Record<string, ComponentType> = {
  "/": WelcomePage,
  "/carta": MenuPage,
  "/register": RegisterPage,
  "/activate": ActivatePage,
  "/login": LoginPage,
  "/order": OrderPage,
  "/my-orders": MyOrdersPage,
  "/staff": StaffHomePage,
  "/staff/orders": StaffOrdersPage,
  "/owner/menu": OwnerMenuPage,
  "/owner/products/new": ProductFormPage,
  "/owner/products/edit": ProductFormPage,
  "/owner/billing": BillingPage,
};

export default function App() {
  const Page = PAGES[window.location.pathname] ?? WelcomePage;
  return <Page />;
}
