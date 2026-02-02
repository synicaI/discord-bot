import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const WEBHOOK_URL = process.env.WEBHOOK_URL;

const ADMIN_IDS = [
  "1001562621381714080",
  "1375016755822596096",
  "1389631531114430594",
  "1255892341206552607"
];

// ================= STORAGE =================
const keys = new Map();

// ================= HELPERS =================
async function logWebhook(title, fields) {
    if (!WEBHOOK_URL) return;

    await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [{
                title,
                color: 0x2b2d31,
                fields,
                timestamp: new Date().toISOString()
            }]
        })
    });
}

function requireAdmin(req, res, next) {
    const adminId = req.headers["x-admin-id"];
    if (!ADMIN_IDS.includes(adminId)) {
        return res.status(403).send("FORBIDDEN");
    }
    next();
}

// ================= ADMIN ROUTES =================
app.post("/admin/key/add", requireAdmin, async (req, res) => {
    const { key, admin } = req.body;
    if (!key) return res.status(400).send("NO_KEY");

    keys.set(key, { hwid: null });

    await logWebhook("🔑 Key Added", [
        { name: "Key", value: key },
        { name: "By", value: admin }
    ]);

    res.send("OK");
});

app.post("/admin/key/delete", requireAdmin, async (req, res) => {
    const { key, admin } = req.body;
    if (!keys.has(key)) return res.status(404).send("NOT_FOUND");

    keys.delete(key);

    await logWebhook("🗑️ Key Deleted", [
        { name: "Key", value: key },
        { name: "By", value: admin }
    ]);

    res.send("OK");
});

app.get("/admin/key/list", requireAdmin, (req, res) => {
    res.json([...keys.entries()]);
});

// ================= ROBLOX AUTH =================
app.get("/v9/auth", async (req, res) => {
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

        await logWebhook("🔒 HWID Locked", [
            { name: "Key", value: k },
            { name: "HWID", value: hwid },
            { name: "PlaceId", value: experienceId }
        ]);
    }

    if (data.hwid !== hwid) {
        return res.status(401).send("AUTH_FAIL");
    }

    res.status(200).send("OK");
});

// ================= START =================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("API ONLINE"));
