import express from "express";
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 8080;
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ===== SINGLE SOURCE OF TRUTH =====
const keys = {}; // { key: { hwid: string|null } }

// ===== AUTH ROUTE (ROBLOX) =====
app.get("/v9/auth", (req, res) => {
  const { secret, k, hwid } = req.query;

  if (secret !== SECRET_KEY) return res.status(401).send("bad secret");
  if (!k || !keys[k]) return res.status(401).send("key not found");

  const data = keys[k];

  if (!data.hwid) {
    data.hwid = hwid;
  } else if (data.hwid !== hwid) {
    return res.status(401).send("hwid mismatch");
  }

  return res.status(200).send("");
});

// ===== BOT ROUTES =====
app.post("/bot/key/add", (req, res) => {
  const { key } = req.body;
  if (!key) return res.json({ ok: false });

  keys[key] = { hwid: null };
  return res.json({ ok: true });
});

app.get("/bot/key/list", (req, res) => {
  return res.json(Object.keys(keys));
});

app.post("/bot/key/reset", (req, res) => {
  const { key } = req.body;
  if (!keys[key]) return res.json({ ok: false });

  keys[key].hwid = null;
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});

import "./bot.js";
