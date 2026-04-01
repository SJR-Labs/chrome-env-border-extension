(function () {
  const DEFAULT_RULES = [
    { regex: "^localhost$|^127\\.0\\.0\\.1$", color: "#4CAF50", label: "LOCAL", priority: 100 },
    { regex: "(^|\\.)int\\.", color: "#2196F3", label: "INT", priority: 80 },
    { regex: "(^|\\.)uat\\.", color: "#FF9800", label: "UAT", priority: 60 },
    { regex: "(^|\\.)prod\\.|(^|\\.)www\\.", color: "#F44336", label: "PROD", priority: 40 }
  ];

  function safeParseRegex(pattern) {
    try { return new RegExp(pattern, "i"); }
    catch { return null; }
  }

  function getMatchingRule(hostname, rules) {
    return rules
      .map(r => ({ ...r, regexObj: safeParseRegex(r.regex) }))
      .filter(r => r.regexObj && r.regexObj.test(hostname))
      .sort((a, b) => b.priority - a.priority)[0];
  }

  function applyBorder(rule) {
    const style = document.createElement("style");
    style.textContent = `html { box-sizing: border-box !important; border: 6px solid ${rule.color} !important; }`;
    document.documentElement.appendChild(style);

    const badge = document.createElement("div");
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

    document.addEventListener("DOMContentLoaded", () => {
      document.body.appendChild(badge);
    });
  }

  function validateRules(rules) {
    return rules.filter(r => r.regex && r.color && r.label && typeof r.priority === "number");
  }

  chrome.storage.sync.get(["rules"], (result) => {
    const hostname = window.location.hostname.toLowerCase();
    const rules = validateRules(result.rules || DEFAULT_RULES);
    const match = getMatchingRule(hostname, rules);
    if (match) applyBorder(match);
  });
})();