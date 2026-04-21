(function () {
  const DEFAULT_RULES = [
    {regex: "^localhost$|^127\\.0\\.0\\.1$", color: "#4CAF50", label: "LOCAL", priority: 100},
    {regex: "(^|\\.)int\\.", color: "#2196F3", label: "INT", priority: 80},
    {regex: "(^|\\.)uat\\.", color: "#FF9800", label: "UAT", priority: 60},
    {regex: "(^|\\.)prod\\.", color: "#F44336", label: "PROD", priority: 40}
  ];
  const STYLE_ID = "env-border-extension-style";
  const BADGE_ID = "env-border-extension-badge";
  const OVERLAY_ID = "env-border-extension-overlay";

  function safeParseRegex(pattern) {
    try {
      return new RegExp(pattern, "i");
    } catch {
      return null;
    }
  }

  function normalizeRules(rules) {
    if (!Array.isArray(rules)) return DEFAULT_RULES;

    return rules
      .map(r => ({
        regex: typeof r.regex === "string" ? r.regex.trim() : "",
        color: typeof r.color === "string" ? r.color : "",
        label: typeof r.label === "string" ? r.label.trim() : "",
        priority: Number(r.priority)
      }))
      .filter(r => r.regex && r.color && r.label && Number.isFinite(r.priority));
  }

  function getMatchingRule(hostname, rules) {
    return rules
      .map(r => ({...r, regexObj: safeParseRegex(r.regex)}))
      .filter(r => r.regexObj && r.regexObj.test(hostname))
      .sort((a, b) => b.priority - a.priority)[0];
  }

  function clearBorder() {
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(BADGE_ID)?.remove();
    document.getElementById(OVERLAY_ID)?.remove();
  }

  function applyBorder(rule) {
    clearBorder();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `#${OVERLAY_ID} { position: fixed !important; inset: 0 !important; box-sizing: border-box !important; border: 6px solid ${rule.color} !important; pointer-events: none !important; z-index: 2147483646 !important; }`;
    document.documentElement.appendChild(style);
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;

    const badge = document.createElement("div");
    badge.id = BADGE_ID;
    badge.textContent = rule.label;
    Object.assign(badge.style, {
      position: "fixed",
      top: "0",
      right: "0",
      zIndex: "2147483647",
      background: rule.color,
      color: "#fff",
      padding: "6px 10px",
      fontSize: "12px",
      fontWeight: "bold",
      fontFamily: "monospace",
      borderBottomLeftRadius: "6px",
      pointerEvents: "none"
    });

    const appendBadge = () => {
      const parent = document.body || document.documentElement;
      if (!parent) return;
      document.getElementById(OVERLAY_ID)?.remove();
      document.getElementById(BADGE_ID)?.remove();
      parent.appendChild(overlay);
      parent.appendChild(badge);
    };

    if (document.documentElement) {
      appendBadge();
      return;
    }

    document.addEventListener("DOMContentLoaded", appendBadge, {once: true});
  }

  function evaluateRules(rules) {
    const hostname = window.location.hostname.toLowerCase();
    const match = getMatchingRule(hostname, normalizeRules(rules));

    if (match) {
      applyBorder(match);
      return;
    }

    clearBorder();
  }

  chrome.storage.sync.get({rules: DEFAULT_RULES}, (result) => {
    evaluateRules(result.rules);
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes.rules) return;
    evaluateRules(changes.rules.newValue);
  });
})();
