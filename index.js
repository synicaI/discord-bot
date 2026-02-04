import express from "express";

export const keys = new Map(); 
// key => { hwid: string | null }

const app = express();

const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const PORT = 8080;

app.get("/v9/auth", (req, res) => {
  const { SECRET_KEY: secret, k, hwid } = req.query;

  console.log("==== AUTH ATTEMPT ====");
  console.log({ k, hwid });

  if (secret !== SECRET_KEY) {
    return res.status(403).send("bad secret");
  }

  if (!k || !hwid) {
    return res.status(400).send("missing params");
  }

  const entry = keys.get(k);
  if (!entry) {
    return res.status(401).send("invalid key");
  }

  // First execution → lock HWID
  if (!entry.hwid) {
    entry.hwid = hwid;
    keys.set(k, entry);
    console.log("HWID locked:", hwid);
    return res.send(""); // SUCCESS
  }

  // HWID mismatch
  if (entry.hwid !== hwid) {
    return res.status(401).send("hwid mismatch");
  }

  // Success
  return res.send("");
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});
