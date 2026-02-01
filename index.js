import express from "express";
const app = express();

const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.SECRET_KEY || "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ================= KEYS =================
const keys = {
  "0001": { hwid: null, expires: null }
};

// ================= AUTH ROUTE =================
app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid, experienceId } = req.query;

  if (secret !== SECRET_KEY) {
    return res.sendStatus(401);
  }

  if (!k || !keys[k]) {
    return res.sendStatus(401); // ❌ invalid key
  }

  if (!hwid) {
    return res.sendStatus(403);
  }

  if (!experienceId) {
    return res.sendStatus(403);
  }

  const keyData = keys[k];

  if (keyData.expires && Date.now() > keyData.expires) {
    return res.sendStatus(403);
  }

  if (!keyData.hwid) {
    keyData.hwid = hwid; // 🔒 lock on first use
    return res.sendStatus(200);
  }

  if (keyData.hwid !== hwid) {
    return res.sendStatus(403);
  }

  return res.sendStatus(200); // ✅ SUCCESS
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});
