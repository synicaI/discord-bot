import express from "express";
const app = express();

// ================= CONFIG =================
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.SECRET_KEY;

// ================= DATA =================
// In-memory key store (restart = reset)
const keys = {};

// ================= HELPERS =================
function unauthorized(res, reason) {
  return res.status(403).send(reason);
}

app.use(express.json());

// ================= ROBLOX AUTH =================
app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid, experienceId } = req.query;

  if (secret !== SECRET_KEY) return unauthorized(res, "Invalid secret");
  if (!k || !keys[k]) return unauthorized(res, "Key not found");
  if (!hwid) return unauthorized(res, "HWID missing");
  if (!experienceId) return unauthorized(res, "ExperienceId missing");

  const keyData = keys[k];

  // Expiration check (null = lifetime)
  if (keyData.expires && new Date() > new Date(keyData.expires)) {
    return unauthorized(res, "Key expired");
  }

  // HWID lock
  if (!keyData.hwid) {
    keyData.hwid = hwid;
  } else if (keyData.hwid !== hwid) {
    return unauthorized(res, "HWID mismatch");
  }

  // SUCCESS
  return res.status(200).send("OK");
});

// ================= ADMIN: ADD / UPDATE KEY =================
app.post("/admin/key", (req, res) => {
  const { secret, key, expires } = req.body;

  if (secret !== SECRET_KEY) return res.status(403).send("Forbidden");
  if (!key || key.length < 6) return res.status(400).send("Invalid key");

  if (expires && isNaN(Date.parse(expires))) {
    return res.status(400).send("Invalid expiration date");
  }

  keys[key] = {
    hwid: null,          // ALWAYS null → first use locks
    expires: expires || null
  };

  res.send(`Key ${key} added`);
});

// ================= ADMIN: DELETE KEY =================
app.delete("/admin/key", (req, res) => {
  const { secret, key } = req.body;

  if (secret !== SECRET_KEY) return res.status(403).send("Forbidden");
  if (!key || !keys[key]) return res.status(404).send("Key not found");

  delete keys[key];
  res.send(`Key ${key} deleted`);
});

// ================= ADMIN: RESET HWID =================
app.get("/reset-hwid", (req, res) => {
  const { secret, k } = req.query;

  if (secret !== SECRET_KEY) return res.status(403).send("Forbidden");
  if (!k || !keys[k]) return res.status(404).send("Key not found");

  keys[k].hwid = null;
  res.send("HWID reset");
});

// ================= ADMIN: LIST KEYS =================
app.get("/admin/keys", (req, res) => {
  const { secret } = req.query;
  if (secret !== SECRET_KEY) return res.status(403).send("Forbidden");
  res.json(keys);
});

// ================= START =================
app.listen(PORT, () => {
  console.log("Auth server running");
});
