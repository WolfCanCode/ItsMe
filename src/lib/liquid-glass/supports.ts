export function supportsBackdropFilterUrl(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.createElement("div");
  el.style.cssText = "backdrop-filter: url(#test)";
  return (
    el.style.backdropFilter === "url(#test)" ||
    el.style.backdropFilter === 'url("#test")'
  );
}
