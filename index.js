import express from "express";
import fetch from "node-fetch"; // make sure node-fetch is installed: npm install node-fetch

const app = express();
app.use(express.json());

const WEBHOOK_URL = process.env.WEBHOOK_URL || null; // can be null

// ================= KEYS =================
const keys = new Map();

// ================= HELPER =================
async function logWebhook(title, fields) {
    if (!WEBHOOK_URL) return; // skip if not provided

    try {
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
    } catch (err) {
        console.warn("Failed to send webhook:", err.message);
    }
}

// ================= ADMIN ROUTES =================
app.post("/admin/key/add", async (req, res) => {
    const { key, admin } = req.body;
    if (!key) return res.status(400).send("Missing key");

    keys.set(key, { hwid: null, expires: null });

    await logWebhook("🔑 Key Added", [
        { name: "Key", value: key, inline: true },
        { name: "By", value: admin ?? "Unknown", inline: true }
    ]);

    res.send("OK");
});

app.post("/admin/key/delete", async (req, res) => {
    const { key, admin } = req.body;
    if (!keys.has(key)) return res.status(404).send("Not found");

    keys.delete(key);

    await logWebhook("🗑️ Key Deleted", [
        { name: "Key", value: key, inline: true },
        { name: "By", value: admin ?? "Unknown", inline: true }
    ]);

    res.send("OK");
});

app.get("/admin/key/list", (req, res) => {
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

    // HWID lock
    if (data.hwid === null) {
        data.hwid = hwid;
        keys.set(k, data);

        await logWebhook("🔒 HWID Locked", [
            { name: "Key", value: k },
            { name: "HWID", value: hwid },
            { name: "ExperienceId", value: experienceId }
        ]);
    }

    if (data.hwid !== hwid) {
        return res.status(401).send("AUTH_FAIL");
    }

    return res.status(200).send(""); // success
});

// ================= START =================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Auth server running on port ${PORT}`);
});
