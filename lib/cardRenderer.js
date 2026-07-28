/**
 * cardRenderer.js
 * ------------------------------------------------------------
 * "Step 3: Generate dynamic HTML card / avatar preview response"
 * Ye function ek profile record leke uska HTML card banata hai.
 * Isse hum single-card page aur "all profiles" gallery page,
 * dono jagah reuse kar sakte hain.
 * ------------------------------------------------------------
 */

const { escapeHtml, labelForLink } = require("./utils");
// NOTE: utils.js is in the same lib/ folder, so this relative path stays "./utils"

function renderIcon(key) {
  const icons = {
    github: "🐙",
    linkedin: "💼",
    instagram: "📸",
    twitter: "🐦",
    portfolio: "🌐",
  };
  return icons[key] || "🔗";
}

function renderCard(profile) {
  const { name, initials, bio, skills, links, avatarColor, createdAt, id } =
    profile;

  const skillsHtml = skills.length
    ? skills
        .map((s) => `<span class="skill-badge">${escapeHtml(s)}</span>`)
        .join("")
    : `<span class="skill-badge skill-empty">No skills added</span>`;

  const linkEntries = Object.entries(links || {}).filter(([, v]) => v);
  const linksHtml = linkEntries.length
    ? linkEntries
        .map(
          ([key, url]) => `
        <a class="social-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
          <span class="social-icon">${renderIcon(key)}</span>
          <span>${escapeHtml(labelForLink(key))}</span>
        </a>`
        )
        .join("")
    : `<p class="no-links">No social links added</p>`;

  const dateStr = new Date(createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return `
  <article class="profile-card" data-id="${escapeHtml(id)}">
    <div class="card-banner" style="background: linear-gradient(135deg, ${avatarColor.from}, ${avatarColor.to});">
      <div class="avatar" style="background: linear-gradient(135deg, ${avatarColor.from}, ${avatarColor.to});">
        ${escapeHtml(initials)}
      </div>
    </div>
    <div class="card-body">
      <h2 class="card-name">${escapeHtml(name)}</h2>
      <p class="card-bio">${escapeHtml(bio) || "<em>No bio provided.</em>"}</p>

      <div class="skills-wrap">${skillsHtml}</div>

      <div class="links-wrap">${linksHtml}</div>

      <p class="card-meta">Created: ${dateStr}</p>
    </div>
  </article>`;
}

module.exports = { renderCard };
