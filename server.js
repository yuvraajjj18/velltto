const express = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { MongoClient, ObjectId } = require("mongodb");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB || "velto";
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!MONGODB_URI || !SESSION_SECRET) {
  console.error("Missing MONGODB_URI or SESSION_SECRET environment variable.");
  process.exit(1);
}

const mongoClient = new MongoClient(MONGODB_URI);
let users;
let workspaces;

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "1mb" }));

app.use(session({
  name: "velto.sid",
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ client: mongoClient, dbName: DB_NAME, collectionName: "sessions", ttl: 60 * 60 * 24 * 30 }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30
  }
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait 15 minutes and try again." }
});

function cleanUsername(value) {
  return String(value || "").trim().toLowerCase();
}
function validUsername(value) {
  return /^[a-z0-9_]{3,20}$/.test(value);
}
function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Please log in first." });
  next();
}
function publicUser(user) {
  return { id: user._id.toString(), username: user.username };
}

app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const username = cleanUsername(req.body.username);
    const password = String(req.body.password || "");
    if (!validUsername(username)) return res.status(400).json({ error: "Username must be 3–20 characters: letters, numbers or underscore." });
    if (password.length < 8 || password.length > 72 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ error: "Password must be 8–72 characters." });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = { username, passwordHash, createdAt: new Date() };
    try {
      const result = await users.insertOne(user);
      user._id = result.insertedId;
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ error: "That username is already taken." });
      throw error;
    }
    req.session.regenerate(err => {
      if (err) return res.status(500).json({ error: "Could not start your session." });
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.save(saveErr => {
        if (saveErr) return res.status(500).json({ error: "Account created, but session could not be saved. Please log in." });
        res.status(201).json({ user: publicUser(user) });
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Could not create account. Please try again." });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const username = cleanUsername(req.body.username);
    const password = String(req.body.password || "");
    if (!validUsername(username) || !password) return res.status(401).json({ error: "Invalid username or password." });
    const user = await users.findOne({ username });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!valid) return res.status(401).json({ error: "Invalid username or password." });
    req.session.regenerate(err => {
      if (err) return res.status(500).json({ error: "Could not start your session." });
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.save(saveErr => {
        if (saveErr) return res.status(500).json({ error: "Could not save your session." });
        res.json({ user: publicUser(user) });
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Could not log in. Please try again." });
  }
});

app.get("/api/auth/me", async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  try {
    const user = await users.findOne({ _id: new ObjectId(req.session.userId) }, { projection: { username: 1 } });
    if (!user) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }
    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ error: "Could not check your session." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  req.session.destroy(error => {
    res.clearCookie("velto.sid", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" });
    if (error) return res.status(500).json({ error: "Could not sign out." });
    res.json({ ok: true });
  });
});

app.get("/api/data", requireAuth, async (req, res) => {
  try {
    const row = await workspaces.findOne({ userId: new ObjectId(req.session.userId) });
    res.json({ data: row ? row.payload : null });
  } catch (error) {
    console.error("Workspace read error:", error);
    res.status(500).json({ error: "Could not load your saved workspace." });
  }
});

app.put("/api/data", requireAuth, async (req, res) => {
  try {
    const source = req.body || {};
    const payload = {
      profile: source.profile && typeof source.profile === "object" ? source.profile : null,
      tasks: Array.isArray(source.tasks) ? source.tasks : [],
      library: Array.isArray(source.library) ? source.library : [],
      backlog: source.backlog && typeof source.backlog === "object" && !Array.isArray(source.backlog) ? source.backlog : {},
      habits: Array.isArray(source.habits) ? source.habits : [],
      goals: Array.isArray(source.goals) ? source.goals : [],
      errors: Array.isArray(source.errors) ? source.errors : []
    };
    await workspaces.updateOne(
      { userId: new ObjectId(req.session.userId) },
      { $set: { payload, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch (error) {
    console.error("Workspace save error:", error);
    res.status(500).json({ error: "Could not save your workspace." });
  }
});

app.use(express.static(path.join(__dirname), { extensions: ["html"] }));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

async function start() {
  await mongoClient.connect();
  const db = mongoClient.db(DB_NAME);
  users = db.collection("users");
  workspaces = db.collection("workspaces");
  await users.createIndex({ username: 1 }, { unique: true });
  await workspaces.createIndex({ userId: 1 }, { unique: true });
  app.listen(PORT, "0.0.0.0", () => console.log(`VELTO server running on port ${PORT}`));
}

start().catch(error => {
  console.error("VELTO failed to start:", error);
  process.exit(1);
});
