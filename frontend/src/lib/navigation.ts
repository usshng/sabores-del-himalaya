// Changes the page without reloading it: App listens to "popstate" and shows the page of the new address.
export function navigate(to: string) {
  if (to === window.location.pathname + window.location.search) {
    return;
  }
  window.history.pushState(null, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
