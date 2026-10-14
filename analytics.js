// Optional, explicit measurement. Never send form values or checkout URLs.
(() => {
  "use strict";
  const config = window.datasetAnalyticsConfig || {};
  const measurementId = config.measurementId || "";
  if (!config.enabled || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
  const base = "/synthetic-data-checkout/";
  const consentKey = "synthetic_data_checkout_analytics_consent_v1";
  const pages = {
    "": "Dataset catalog", "index.html": "Dataset catalog",
    "phishing-remediation-dataset.html": "Phishing remediation dataset",
    "vendor-risk-assessment-dataset.html": "Vendor risk assessment dataset",
    "commercial-access.html": "Commercial dataset access",
    "terms.html": "Terms", "privacy.html": "Privacy", "refund.html": "Refunds",
  };
  const guideDatasets = {
    "phishing-remediation-dataset.html": "phishing_remediation_reports",
    "vendor-risk-assessment-dataset.html": "third_party_vendor_risks",
  };
  const niches = new Set([
    "hipaa_dental_tickets", "physical_therapy_logs", "dermatology_consultations",
    "pharmacy_rx_questions", "aml_transaction_anomalies", "credit_card_fraud_disputes",
    "mortgage_loan_audits", "lease_agreement_disputes", "employment_contract_disputes",
    "soc_alert_incident_tickets", "it_outage_incidents", "gdpr_compliance_audits",
    "cryptocurrency_audit_trails", "third_party_vendor_risks", "phishing_remediation_reports",
    "corporate_expense_audits", "nda_breach_notifications", "ip_copyright_claims",
    "chiropractic_intake_logs", "database_access_audits",
  ]);
  const sources = new Set(["github_pages", "huggingface", "linkedin", "direct", "newsletter", "community", "tracecat", "thehive", "ciso_assistant"]);
  const mediums = new Set(["catalog", "dataset_guide", "organic_post", "community_post", "personal_intro", "newsletter", "referral", "validation"]);
  const knownDataset = value => typeof value === "string" && value.length <= 100 && niches.has(value.replace(/\d+$/, "")) ? value : "";
  const fileName = url => url.pathname.startsWith(base) ? url.pathname.slice(base.length) : "";
  const campaign = new URLSearchParams(location.search);
  const labels = {};
  if (sources.has(campaign.get("utm_source"))) labels.utm_source = campaign.get("utm_source");
  if (mediums.has(campaign.get("utm_medium"))) labels.utm_medium = campaign.get("utm_medium");
  const campaignName = campaign.get("utm_campaign") || "";
  if (knownDataset(campaignName) || ["soc_workflow_preview", "vendor_workflow_preview", "security_workflows"].includes(campaignName)) labels.utm_campaign = campaignName;
  const safeLocation = value => {
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return "";
      const file = fileName(url);
      const clean = new URL(Object.hasOwn(pages, file) ? base + file : base, location.origin);
      for (const [name, label] of Object.entries(labels)) clean.searchParams.set(name, label);
      return clean.href;
    } catch { return location.origin + base; }
  };
  const safeReferrer = value => {
    try {
      const url = new URL(value);
      if (!["https:", "http:"].includes(url.protocol)) return "";
      return url.origin === location.origin ? safeLocation(url.href) : url.origin + "/";
    } catch { return ""; }
  };
  const currentFile = fileName(new URL(location.href));
  const pageTitle = pages[currentFile] || "Dataset website";
  const contextDataset = knownDataset(campaign.get("niche") || campaign.get("dataset"));
  const dataset = guideDatasets[currentFile] || contextDataset;
  let choice = "", started = false, banner = null;
  try { choice = localStorage.getItem(consentKey) || ""; } catch {}
  const safePage = {
    page_location: safeLocation(location.href), page_referrer: safeReferrer(document.referrer),
    page_title: pageTitle, ...(config.debug ? { debug_mode: true, traffic_type: "internal" } : {}),
  };
  function track(name, extra = {}) {
    if (choice !== "granted" || !started) return;
    const parameters = { ...safePage };
    if (knownDataset(extra.dataset_id)) parameters.dataset_id = extra.dataset_id;
    if (labels.utm_source) parameters.campaign_source = labels.utm_source;
    if (labels.utm_medium) parameters.campaign_medium = labels.utm_medium;
    if (labels.utm_campaign) parameters.campaign_name = labels.utm_campaign;
    window.gtag("event", name, parameters);
  }
  function start() {
    if (started || choice !== "granted") return;
    started = true;
    window["ga-disable-" + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    window.gtag("js", new Date());
    window.gtag("set", { ...safePage, allow_google_signals: false, allow_ad_personalization_signals: false });
    window.gtag("config", measurementId, { ...safePage, send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_path: base, cookie_domain: location.hostname, cookie_flags: "SameSite=Lax;Secure" });
    const script = document.createElement("script");
    script.async = true;
    script.referrerPolicy = "strict-origin";
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    document.head.appendChild(script);
    track("page_view");
    if (dataset) track(currentFile === "commercial-access.html" ? "access_page_view" : "dataset_view", { dataset_id: dataset });
  }
  function setConsent(value) {
    choice = value === "granted" ? "granted" : "denied";
    try { localStorage.setItem(consentKey, choice); } catch {}
    if (banner) { banner.remove(); banner = null; }
    if (choice === "granted") {
      if (started) {
        window["ga-disable-" + measurementId] = false;
        window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      } else start();
    }
    else {
      window["ga-disable-" + measurementId] = true;
      if (started) window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      for (const cookie of document.cookie.split(";")) {
        const name = cookie.split("=")[0].trim();
        if (/^_ga(?:_|$)/.test(name)) {
          document.cookie = name + "=; Max-Age=0; Path=" + base + "; SameSite=Lax; Secure";
          document.cookie = name + "=; Max-Age=0; Path=" + base + "; Domain=" + location.hostname + "; SameSite=Lax; Secure";
        }
      }
    }
  }
  function preferences() {
    if (banner) return;
    banner = document.createElement("section");
    banner.className = "analytics-consent";
    banner.setAttribute("aria-label", "Optional website analytics");
    const text = document.createElement("p");
    text.textContent = "Allow optional Google Analytics to help us understand which datasets people explore? Buyer usernames and payment details are excluded. You can change your choice below.";
    const row = document.createElement("div"); row.className = "button-row";
    const allow = document.createElement("button"); allow.type = "button"; allow.className = "button"; allow.textContent = "Allow analytics";
    const decline = document.createElement("button"); decline.type = "button"; decline.className = "button secondary"; decline.textContent = "No thanks";
    const privacy = document.createElement("a"); privacy.href = base + "privacy.html"; privacy.textContent = "Privacy details";
    allow.addEventListener("click", () => setConsent("granted"));
    decline.addEventListener("click", () => setConsent("denied"));
    row.appendChild(allow); row.appendChild(decline); row.appendChild(privacy);
    banner.appendChild(text); banner.appendChild(row); document.body.appendChild(banner);
  }
  window.datasetAnalytics = Object.freeze({ setConsent, preferences });
  document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector(".footer") || document.body;
    const settings = document.createElement("button"); settings.type = "button"; settings.className = "analytics-settings";
    settings.textContent = "Analytics preferences"; settings.addEventListener("click", preferences); footer.appendChild(settings);
    if (choice === "granted") start(); else if (choice !== "denied") preferences();
  });
  document.addEventListener("click", event => {
    const link = event.target.closest && event.target.closest("a[href]");
    if (!link || event.defaultPrevented) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (link.id === "checkout") {
      const username = document.querySelector("#hf-username");
      if (dataset && username && username.value.trim() && url.origin === "https://syntheticdatasetlab.lemonsqueezy.com" && url.pathname.startsWith("/checkout/buy/")) track("checkout_link_click", { dataset_id: dataset });
      return;
    }
    const targetGuide = url.origin === location.origin ? guideDatasets[fileName(url)] : "";
    if (targetGuide) track("dataset_guide_click", { dataset_id: targetGuide });
    else if (url.origin === location.origin && fileName(url) === "commercial-access.html") track("access_link_click", { dataset_id: knownDataset(url.searchParams.get("niche")) });
    else if (url.origin === location.origin && fileName(url) === "inspect_preview.py") track("example_download_click", { dataset_id: dataset });
    else if (url.origin === "https://huggingface.co") {
      const matched = /^\/datasets\/HaseebDev\/([^/]+)(.*)$/.exec(url.pathname);
      const preview = matched && knownDataset(matched[1]);
      if (preview) track(matched[2].includes("quality-audit") ? "audit_link_click" : matched[2].includes("demo.jsonl") ? "preview_download_click" : "preview_link_click", { dataset_id: preview });
    }
  });
})();
