# 🪪 User Profile Card Generator — Vercel Edition

Same app as before, but restructured to deploy cleanly on **Vercel**:

- Dynamic routes (`/profile`, `/profiles`, `/api/*`) run as a **serverless
  function** (`api/index.js`)
- Static files (`public/index.html`, `public/style.css`) are served directly
  by Vercel's CDN
- Storage uses **MongoDB Atlas** (persistent) — with an **in-memory
  fallback** so it still runs even before you set up a database

## 📂 Project Structure

```
profile-card-vercel/
├── api/
│   └── index.js        # Express app → deployed as Vercel serverless function
├── lib/
│   ├── db.js            # Mongo / in-memory storage layer
│   ├── utils.js          # String manipulation helpers
│   └── cardRenderer.js   # Dynamic HTML card builder
├── models/
│   └── Profile.js        # Mongoose schema
├── public/
│   ├── index.html         # The form (static)
│   └── style.css
├── server.js              # LOCAL DEV ONLY — not used by Vercel
├── vercel.json             # Routes dynamic paths to the serverless function
├── package.json
└── .env.example
```

## ⚠️ Why not the JSON-file database from before?

Vercel's serverless functions run on a **read-only, ephemeral filesystem** —
each request can even hit a different container. Writing to a `db.json` file
would either fail or silently reset. So for Vercel, storage needs to be an
external database. This version uses **MongoDB Atlas** (free tier is
plenty for a project like this).

If `MONGODB_URI` is not set, the app still works using in-memory storage —
good for a quick test deploy — but data will disappear frequently since
serverless functions restart often. **Set up Atlas before your final
submission/demo.**

---

## 🚀 Step-by-Step: Deploy to Vercel

### 1. Get a free MongoDB Atlas database (~5 min)

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free)
2. Create a free **M0 cluster**
3. Under **Database Access**, create a DB user with a username/password
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere
   — needed since Vercel's IPs are dynamic)
5. Click **Connect → Drivers → Node.js**, copy the connection string. It
   looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add a database name to it before the `?`, e.g.:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/profile-cards?retryWrites=true&w=majority
   ```

### 2. Push this project to GitHub

```bash
cd profile-card-vercel
git init
git add .
git commit -m "Profile Card Generator - Vercel ready"
git branch -M main
git remote add origin https://github.com/harshtrivedi4480-cyber/profile-card-generator.git
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to https://vercel.com and log in with GitHub
2. Click **Add New → Project**, select this repo
3. Framework Preset: **Other** (Vercel auto-detects the `api/` folder)
4. Before clicking Deploy, open **Environment Variables** and add:
   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | *(paste your Atlas connection string from Step 1)* |
5. Click **Deploy**

That's it — Vercel will give you a live URL like
`https://profile-card-generator.vercel.app`.

### 4. (Optional) Test locally first

```bash
npm install
cp .env.example .env
# paste your MONGODB_URI into .env
npm run dev
# open http://localhost:3000
```
# 🪪 User Profile Card Generator — Vercel Edition

🔗 **Live Demo:** [profile-card-generator-qwqn.vercel.app](https://profile-card-generator-qwqn.vercel.app/)

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://profile-card-generator-qwqn.vercel.app/)

  
---

## 🔌 Routes

| Method | Route                  | Description                                 |
|--------|-------------------------|----------------------------------------------|
| GET    | `/`                     | Profile creation form (static)              |
| POST   | `/profile`               | Process form, save to DB, return card HTML  |
| GET    | `/profiles`               | Gallery of all saved profiles               |
| GET    | `/profile/:id`            | View a single profile card                  |
| POST   | `/profile/:id/delete`     | Delete a profile                            |
| GET    | `/api/profiles`           | JSON API — list all profiles                |
| POST   | `/api/profile`            | JSON API — create a profile                 |

## 🐛 Troubleshooting

- **"MONGODB_URI not set" / data disappearing** → You're in fallback
  in-memory mode. Add the env var in Vercel dashboard (Project → Settings →
  Environment Variables) and redeploy.
- **500 error after deploy** → Check Vercel → your project → **Logs** tab
  for the actual error (usually a wrong Atlas password or missing Network
  Access rule).
- **CSS not loading** → Make sure `public/style.css` exists and wasn't
  excluded by `.vercelignore`/`.gitignore`.
