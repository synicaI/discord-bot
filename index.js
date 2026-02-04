import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const DB_FILE = "./keys.json";

if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");

function loadKeys() {
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
}
function saveKeys(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function auth(req, res, next) {
  if (req.headers["x-secret"] !== SECRET_KEY)
    return res.status(403).json({ error: "Invalid secret" });
  next();
}

app.post("/key/add", auth, (req, res) => {
  const { key } = req.body;
  if (!key) return res.status(400).json({ error: "Missing key" });

  const keys = loadKeys();
  keys[key] = { hwid: null };
  saveKeys(keys);

  res.json({ success: true });
});

app.post("/key/delete", auth, (req, res) => {
  const { key } = req.body;
  const keys = loadKeys();
  delete keys[key];
  saveKeys(keys);
  res.json({ success: true });
});

app.post("/key/reset", auth, (req, res) => {
  const { key } = req.body;
  const keys = loadKeys();
  if (!keys[key]) return res.status(404).json({ error: "Key not found" });

  keys[key].hwid = null;
  saveKeys(keys);
  res.json({ success: true });
});

app.get("/key/list", auth, (req, res) => {
  res.json(Object.keys(loadKeys()));
});

app.post("/key/verify", (req, res) => {
  const { key, hwid } = req.body;
  const keys = loadKeys();

  if (!keys[key]) return res.json({ success: false });

  if (!keys[key].hwid) {
    keys[key].hwid = hwid;
    saveKeys(keys);
    return res.json({ success: true });
  }

  res.json({ success: keys[key].hwid === hwid });
});

app.listen(8080, () => console.log("Auth server running on 8080"));
