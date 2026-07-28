/**
 * lib/db.js
 * ------------------------------------------------------------
 * Database layer with TWO modes:
 *
 * 1. MONGODB MODE (recommended for Vercel / production)
 *    Agar environment variable MONGODB_URI set hai, to saara
 *    data MongoDB Atlas me persistently store hota hai.
 *
 * 2. IN-MEMORY FALLBACK MODE (quick demo only)
 *    Agar MONGODB_URI set nahi hai, to data ek in-memory array
 *    me store hota hai — sirf testing ke liye theek hai.
 *    ⚠️ Vercel serverless functions stateless hote hain, isliye
 *    is mode me har naye request/cold-start pe purana data
 *    gayab ho sakta hai. Production ke liye MONGODB_URI zaroor
 *    set karo (README dekho).
 *
 * Dono modes same interface expose karte hain:
 *   getAll(), getById(id), insert(fields), remove(id)
 * ------------------------------------------------------------
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const Profile = require("../models/Profile");

const MONGODB_URI = process.env.MONGODB_URI;
const USE_MONGO = Boolean(MONGODB_URI);

// ---------- In-memory fallback store ----------
let memoryStore = [];

// ---------- Cached Mongo connection (serverless-safe pattern) ----------
let cached = global._mongooseConn;
if (!cached) cached = global._mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (!USE_MONGO) return null;
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ---------- Public API ----------

async function getAll() {
  if (USE_MONGO) {
    await connectDB();
    const docs = await Profile.find().sort({ createdAt: -1 });
    return docs.map((d) => d.toJSON());
  }
  return [...memoryStore].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

async function getById(id) {
  if (USE_MONGO) {
    await connectDB();
    try {
      const doc = await Profile.findById(id);
      return doc ? doc.toJSON() : null;
    } catch {
      return null; // invalid ObjectId format
    }
  }
  return memoryStore.find((r) => r.id === id) || null;
}

async function insert(fields) {
  if (USE_MONGO) {
    await connectDB();
    const doc = await Profile.create(fields);
    return doc.toJSON();
  }
  const record = {
    id: uuidv4(),
    ...fields,
    createdAt: new Date().toISOString(),
  };
  memoryStore.unshift(record);
  return record;
}

async function remove(id) {
  if (USE_MONGO) {
    await connectDB();
    const res = await Profile.findByIdAndDelete(id).catch(() => null);
    return Boolean(res);
  }
  const before = memoryStore.length;
  memoryStore = memoryStore.filter((r) => r.id !== id);
  return memoryStore.length !== before;
}

module.exports = { getAll, getById, insert, remove, USE_MONGO };
