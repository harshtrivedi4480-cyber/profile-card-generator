/**
 * models/Profile.js
 * ------------------------------------------------------------
 * Mongoose schema — jab MONGODB_URI environment variable set
 * hoga, records isi schema ke through MongoDB Atlas me
 * persistently store honge (Vercel ka filesystem serverless
 * hone ki wajah se ephemeral hota hai, isliye local JSON file
 * ki jagah ab real database use kar rahe hain).
 * ------------------------------------------------------------
 */

const mongoose = require("mongoose");

const LinksSchema = new mongoose.Schema(
  {
    github: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    portfolio: { type: String, default: "" },
  },
  { _id: false }
);

const AvatarColorSchema = new mongoose.Schema(
  {
    from: String,
    to: String,
  },
  { _id: false }
);

const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 60 },
  initials: { type: String, required: true },
  bio: { type: String, default: "", maxlength: 500 },
  skills: { type: [String], default: [] },
  links: { type: LinksSchema, default: () => ({}) },
  avatarColor: { type: AvatarColorSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Reshape MongoDB's _id -> id for consistent use across the app
ProfileSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});
ProfileSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

// Avoid "OverwriteModelError" during hot reloads / repeated serverless invocations
module.exports =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);
