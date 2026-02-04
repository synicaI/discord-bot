import express from "express";
import { keys } from "./store.js";

const app = express();

const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const PORT = 8080;

app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid } = req.query;

  if (secret !== SECRET_KEY) return res.status(403).send("bad secret");
  if (!k || !hwid) return res.status(400).send("missing params");

  const entry = keys.get(k);
  if (!entry) return res.status(401).send("invalid key");

  if (!entry.hwid) {
    entry.hwid = hwid;
    return res.send("");
  }

  if (entry.hwid !== hwid) {
    return res.status(401).send("hwid mismatch");
  }

  res.send("");
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});
