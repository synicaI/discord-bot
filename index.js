import express from "express";
import fs from "fs";

const app = express();
app.use(express.json());

const DATA_FILE = "./keys.json";

/* ================= STORAGE ================= */

let keys = new Map();

function loadKeys() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "{}");
    }

    const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    keys = new Map(Object.entries(raw));
}

function saveKeys() {
    const obj = Object.fromEntries(keys);
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

loadKeys();

/* ================= ADMIN ROUTES ================= */

app.post("/admin/key/add", (req, res) => {
    const { key } = req.body;
    if (!key) return res.status(400).send("Missing key");

    keys.set(key, { hwid: null });
    saveKeys();

    res.send("OK");
});

app.post("/admin/key/delete", (req, res) => {
    const { key } = req.body;
    if (!keys.has(key)) return res.status(404).send("Not found");

    keys.delete(key);
    saveKeys();

    res.send("OK");
});

app.get("/admin/key/list", (req, res) => {
    res.json([...keys.keys()]);
});

/* ================= ROBLOX AUTH ================= */

app.get("/v9/auth", (req, res) => {
    const { k, hwid, experienceId } = req.query;

    if (!k || !hwid || !experienceId) {
        return res.status(401).send("AUTH_FAIL");
    }

    if (!keys.has(k)) {
        return res.status(401).send("AUTH_FAIL");
    }

    const data = keys.get(k);

    if (data.hwid === null) {
        data.hwid = hwid;
        keys.set(k, data);
        saveKeys();
    }

    if (data.hwid !== hwid) {
        return res.status(401).send("AUTH_FAIL");
    }

    return res.status(200).send("OK");
});

/* ================= START ================= */

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Auth server running on port", PORT);
});
