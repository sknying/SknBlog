export function onRouterTransitionStart(url: string) {
  window.dispatchEvent(
    new CustomEvent("sknblog:navigation-start", {
      detail: { url }
    })
  );
}
