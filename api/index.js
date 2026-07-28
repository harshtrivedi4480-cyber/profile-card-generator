/**
 * api/index.js
 * ------------------------------------------------------------
 * Main Express app. On Vercel, this file is deployed as a
 * serverless function and handles all dynamic routes (form
 * submission, card rendering, gallery, JSON API).
 *
 * Static files (public/index.html, public/style.css) are
 * served directly by Vercel's static hosting — see vercel.json
 * rewrites, which only forward the DYNAMIC paths here.
 * ------------------------------------------------------------
 */

const express = require("express");
const path = require("path");

const db = require("../lib/db");
const {
  getInitials,
  nameToColor,
  parseSkills,
  cleanBio,
  normalizeUrl,
} = require("../lib/utils");
const { renderCard } = require("../lib/cardRenderer");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Useful for local dev (node server.js); harmless no-op on Vercel since
// static assets are already served by the platform before hitting here.
app.use(express.static(path.join(__dirname, "..", "public")));

// ---------- Page shell ----------
function pageShell({ title, body, activeNav = "" }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} · Profile Card Generator</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header class="site-header">
    <a href="/" class="brand">🪪 Profile Card Generator</a>
    <nav>
      <a href="/" class="${activeNav === "form" ? "active" : ""}">New Profile</a>
      <a href="/profiles" class="${activeNav === "gallery" ? "active" : ""}">All Profiles</a>
    </nav>
  </header>
  <main>${body}</main>
  <footer class="site-footer">
    Built with Node.js + Express · ${db.USE_MONGO ? "MongoDB Atlas" : "In-memory storage (demo mode — set MONGODB_URI for persistence)"}
  </footer>
</body>
</html>`;
}

// ---------- Routes ----------

// Kept for local dev convenience; on Vercel, "/" is served as a static file.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Step 2 + 3: Process form -> save -> render dynamic card
app.post("/profile", async (req, res) => {
  try {
    const { name, bio, skills, github, linkedin, instagram, twitter, portfolio } =
      req.body;

    if (!name || !name.trim()) {
      return res.status(400).send(
        pageShell({
          title: "Error",
          activeNav: "form",
          body: `<div class="container"><div class="error-box">⚠️ Name is required. <a href="/">Go back</a></div></div>`,
        })
      );
    }

    const cleanedName = name.trim().slice(0, 60);
    const fields = {
      name: cleanedName,
      initials: getInitials(cleanedName),
      bio: cleanBio(bio),
      skills: parseSkills(skills),
      links: {
        github: normalizeUrl(github),
        linkedin: normalizeUrl(linkedin),
        instagram: normalizeUrl(instagram),
        twitter: normalizeUrl(twitter),
        portfolio: normalizeUrl(portfolio),
      },
      avatarColor: nameToColor(cleanedName),
    };

    const profile = await db.insert(fields);
    const cardHtml = renderCard(profile);

    res.send(
      pageShell({
        title: cleanedName,
        activeNav: "form",
        body: `
          <div class="container narrow">
            <div class="success-banner">✅ Profile created successfully!</div>
            ${cardHtml}
            <div class="action-row">
              <a href="/" class="btn btn-secondary">➕ Create Another</a>
              <a href="/profiles" class="btn btn-primary">📇 View All Profiles</a>
            </div>
          </div>`,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(
      pageShell({
        title: "Server Error",
        body: `<div class="container"><div class="error-box">⚠️ Something went wrong: ${err.message}</div></div>`,
      })
    );
  }
});

// Gallery of all saved profiles
app.get("/profiles", async (req, res) => {
  try {
    const profiles = await db.getAll();
    const cardsHtml = profiles.length
      ? profiles
          .map(
            (p) => `
          <div class="gallery-item">
            ${renderCard(p)}
            <form method="POST" action="/profile/${p.id}/delete" class="delete-form"
                  onsubmit="return confirm('Delete this profile?');">
              <button type="submit" class="btn btn-danger btn-small">🗑️ Delete</button>
            </form>
          </div>`
          )
          .join("")
      : `<p class="empty-state">No profiles yet. <a href="/">Create the first one →</a></p>`;

    res.send(
      pageShell({
        title: "All Profiles",
        activeNav: "gallery",
        body: `
          <div class="container">
            <h1 class="page-title">All Profiles (${profiles.length})</h1>
            <div class="gallery-grid">${cardsHtml}</div>
          </div>`,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(
      pageShell({
        title: "Server Error",
        body: `<div class="container"><div class="error-box">⚠️ Could not load profiles: ${err.message}</div></div>`,
      })
    );
  }
});

// Single profile view
app.get("/profile/:id", async (req, res) => {
  try {
    const profile = await db.getById(req.params.id);
    if (!profile) {
      return res.status(404).send(
        pageShell({
          title: "Not Found",
          body: `<div class="container"><div class="error-box">Profile not found.</div></div>`,
        })
      );
    }
    res.send(
      pageShell({
        title: profile.name,
        body: `<div class="container narrow">${renderCard(profile)}</div>`,
      })
    );
  } catch (err) {
    console.error(err);
    res.status(500).send(
      pageShell({
        title: "Server Error",
        body: `<div class="container"><div class="error-box">⚠️ ${err.message}</div></div>`,
      })
    );
  }
});

// Delete a profile
app.post("/profile/:id/delete", async (req, res) => {
  try {
    await db.remove(req.params.id);
    res.redirect("/profiles");
  } catch (err) {
    console.error(err);
    res.status(500).send(
      pageShell({
        title: "Server Error",
        body: `<div class="container"><div class="error-box">⚠️ ${err.message}</div></div>`,
      })
    );
  }
});

// ---------- JSON API ----------
app.get("/api/profiles", async (req, res) => {
  try {
    res.json(await db.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/profile", async (req, res) => {
  try {
    const { name, bio, skills, github, linkedin, instagram, twitter, portfolio } =
      req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    const cleanedName = name.trim().slice(0, 60);
    const fields = {
      name: cleanedName,
      initials: getInitials(cleanedName),
      bio: cleanBio(bio),
      skills: parseSkills(skills),
      links: {
        github: normalizeUrl(github),
        linkedin: normalizeUrl(linkedin),
        instagram: normalizeUrl(instagram),
        twitter: normalizeUrl(twitter),
        portfolio: normalizeUrl(portfolio),
      },
      avatarColor: nameToColor(cleanedName),
    };
    const profile = await db.insert(fields);
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
