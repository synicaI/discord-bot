import express from "express";
const app = express();

const PORT = process.env.PORT || 8080;
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// IN-MEMORY KEYS
const keys = {};

// ===== HELPERS =====
function unauthorized(res, reason) {
  console.log("AUTH FAIL:", reason);
  return res.status(200).send(reason);
}

// ===== AUTH =====
app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid } = req.query;

  if (secret !== SECRET_KEY) return unauthorized(res, "Invalid secret");
  if (!k || !keys[k]) return unauthorized(res, "Key not found");
  if (!hwid) return unauthorized(res, "HWID missing");

  const data = keys[k];

  if (!data.hwid) {
    data.hwid = hwid;
    console.log(`🔒 HWID locked for ${k}`);
  } else if (data.hwid !== hwid) {
    return unauthorized(res, "HWID mismatch");
  }

  return res.status(200).send(""); // success
});

// ===== BOT API =====
app.get("/bot/add", (req, res) => {
  const { secret, key } = req.query;
  if (secret !== SECRET_KEY) return res.send("NO");
  keys[key] = { hwid: null };
  res.send("OK");
});

app.get("/bot/list", (req, res) => {
  const { secret } = req.query;
  if (secret !== SECRET_KEY) return res.send("NO");
  res.json(Object.keys(keys));
});

app.get("/bot/reset", (req, res) => {
  const { secret, key } = req.query;
  if (secret !== SECRET_KEY) return res.send("NO");
  if (keys[key]) keys[key].hwid = null;
  res.send("OK");
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});
