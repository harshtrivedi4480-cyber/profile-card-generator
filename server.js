/**
 * server.js
 * ------------------------------------------------------------
 * LOCAL DEVELOPMENT ONLY.
 * Vercel does NOT use this file — it directly runs api/index.js
 * as a serverless function. This file just lets you run
 * `npm run dev` and test everything on your own machine first.
 * ------------------------------------------------------------
 */

const app = require("./api/index.js");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Local dev server running at http://localhost:${PORT}`);
  console.log(
    process.env.MONGODB_URI
      ? "📦 Using MongoDB Atlas for storage"
      : "⚠️  No MONGODB_URI set — using in-memory storage (data resets on restart)"
  );
});
