/**
 * utils.js
 * ------------------------------------------------------------
 * Server-side string manipulation helpers.
 * Ye file "Step 2: Process input data on Node.js server" ka
 * core logic hold karti hai.
 * ------------------------------------------------------------
 */

// Basic HTML-escape taaki koi <script> tag inject na kar paaye (XSS safety)
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// "Harsh Trivedi" -> "HT"
function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Name string se deterministic HSL color generate karta hai
// (same naam => hamesha same avatar color)
function nameToColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return {
    from: `hsl(${hue}, 70%, 55%)`,
    to: `hsl(${(hue + 40) % 360}, 70%, 45%)`,
  };
}

// "React, Node.js,  MongoDB ,,Express" -> ["React", "Node.js", "MongoDB", "Express"]
function parseSkills(skillsRaw = "") {
  return skillsRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20); // safety cap
}

// Bio ko clean karo: extra whitespace/newlines trim, length cap
function cleanBio(bio = "", maxLen = 500) {
  const trimmed = bio.trim().replace(/\s+/g, " ");
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) + "…" : trimmed;
}

// Social link ko normalize karo -> agar "http" missing hai to add karo
function normalizeUrl(url = "") {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}

// URL se platform-friendly label nikalna (github.com/xyz -> "GitHub")
function labelForLink(key) {
  const map = {
    github: "GitHub",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    twitter: "Twitter / X",
    portfolio: "Portfolio",
  };
  return map[key] || key;
}

module.exports = {
  escapeHtml,
  getInitials,
  nameToColor,
  parseSkills,
  cleanBio,
  normalizeUrl,
  labelForLink,
};
