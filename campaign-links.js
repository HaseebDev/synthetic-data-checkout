// Pass explicit campaign labels between our pages and the existing checkout link.
// No cookies, local storage, identifiers, network calls, or analytics collection.
(() => {
  const incoming = new URLSearchParams(location.search);
  const labels = {};
  for (const name of ["utm_source", "utm_medium", "utm_campaign"]) {
    const value = incoming.get(name);
    if (value && /^[a-z0-9][a-z0-9_.-]{0,79}$/i.test(value)) labels[name] = value;
  }
  window.datasetCampaignUrl = (value) => {
    if (!value || !Object.keys(labels).length) return value;
    try {
      const url = new URL(value, location.href);
      const internal = url.origin === "https://haseebdev.github.io" && url.pathname.startsWith("/synthetic-data-checkout/");
      const checkout = url.origin === "https://syntheticdatasetlab.lemonsqueezy.com" && url.pathname.startsWith("/checkout/buy/");
      if (!internal && !checkout) return value;
      for (const [name, label] of Object.entries(labels)) url.searchParams.set(name, label);
      const nested = url.searchParams.get("checkout_url");
      if (internal && nested) {
        const payment = new URL(nested);
        if (payment.origin === "https://syntheticdatasetlab.lemonsqueezy.com" && payment.pathname.startsWith("/checkout/buy/")) {
          for (const [name, label] of Object.entries(labels)) payment.searchParams.set(name, label);
          url.searchParams.set("checkout_url", payment.href);
        }
      }
      return url.href;
    } catch { return value; }
  };
  document.addEventListener("DOMContentLoaded", () => {
    for (const link of document.querySelectorAll("a[href]")) {
      if (!link.hasAttribute("download")) link.href = window.datasetCampaignUrl(link.href);
    }
  });
})();
