const express = require("express");
const app = express();

const PORT = process.env.PORT || 8080;
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ================= KEYS =================
const keys = {
  "a9c3f72b5e4d8190f1c7b2e3d6a98c41": { hwid: null, expires: null },
  "x972jsdjdinsdvbdozopnksd92ejd919": { hwid: null, expires: null }
};

// ================= HELPERS =================
function unauthorized(res, reason) {
  console.log("AUTH FAIL:", reason);
  return res.status(200).send(reason);
}

// ================= AUTH =================
app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid, experienceId } = req.query;

  console.log("==== AUTH ATTEMPT ====");
  console.log({ k, hwid, experienceId });

  if (secret !== SECRET_KEY) return unauthorized(res, "Invalid secret");
  if (!k || !keys[k]) return unauthorized(res, "Key not found");
  if (!hwid) return unauthorized(res, "HWID missing");

  const data = keys[k];

  if (!data.hwid) {
    data.hwid = hwid;
    console.log(`🔒 HWID LOCKED for ${k}: ${hwid}`);
  } else if (data.hwid !== hwid) {
    return unauthorized(res, "HWID mismatch");
  }

  console.log(`✅ AUTH SUCCESS: ${k}`);
  return res.status(200).send("");
});

// ================= HWID RESET =================
app.get("/reset-hwid", (req, res) => {
  const { k, secret } = req.query;

  if (secret !== SECRET_KEY) return res.status(403).send("Forbidden");
  if (!k || !keys[k]) return res.status(404).send("Key not found");

  keys[k].hwid = null;
  console.log(`🔁 HWID RESET for ${k}`);
  return res.send("HWID reset");
});

// ================= EXPORT FOR BOT =================
module.exports = { keys, SECRET_KEY };

// ================= START =================
app.listen(PORT, () => {
  console.log(`Auth server running on port ${PORT}`);
});
