import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY || "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const PORT = process.env.PORT || 3000;

const DB_FILE = "./keys.json";

if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

const loadDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const saveDB = (db) => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

/* ================= AUTH ================= */

app.get("/v9/auth", (req, res) => {
    const { SECRET_KEY: sk, k, hwid, experienceId } = req.query;

    if (sk !== SECRET_KEY) return res.status(403).send("Invalid secret");
    if (!k || !hwid || !experienceId) return res.status(400).send("Missing data");

    const db = loadDB();
    const keyData = db[k];

    if (!keyData) return res.status(401).send("Key not found");

    if (!keyData.hwid) {
        keyData.hwid = hwid;
        saveDB(db);
        return res.send("");
    }

    if (keyData.hwid !== hwid) {
        return res.status(401).send("HWID mismatch");
    }

    res.send("");
});

/* ================= ADMIN ================= */

app.post("/admin/key/add", (req, res) => {
    const { secret, key } = req.body;
    if (secret !== SECRET_KEY) return res.sendStatus(403);

    const db = loadDB();
    if (db[key]) return res.status(400).send("Key exists");

    db[key] = { hwid: null, created: Date.now() };
    saveDB(db);

    res.send("OK");
});

app.post("/admin/key/delete", (req, res) => {
    const { secret, key } = req.body;
    if (secret !== SECRET_KEY) return res.sendStatus(403);

    const db = loadDB();
    delete db[key];
    saveDB(db);

    res.send("OK");
});

app.get("/admin/key/list", (req, res) => {
    if (req.query.secret !== SECRET_KEY) return res.sendStatus(403);
    res.json(loadDB());
});

app.listen(PORT, () => {
    console.log("Auth server running on port", PORT);
});
