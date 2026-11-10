// This is for navegate between pages without reloading
export function navigate(to: string) {
  if (to === window.location.pathname + window.location.search) {
    return;
  }
  window.history.pushState(null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
