const express = require("express");
const fs = require("fs");
const { Client, GatewayIntentBits } = require("discord.js");

/* ================= CONFIG ================= */

const BOT_TOKEN = process.env.BOT_TOKEN; // REQUIRED
const ALLOWED_USERS = [
    "1001562621381714080",
    "1375016755822596096",
    "1389631531114430594",
    "1255892341206552607"
];

const DATA_FILE = "./keys.json";

/* ================= STORAGE ================= */

let keys = new Map();

function loadKeys() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "{}");
    }
    keys = new Map(Object.entries(JSON.parse(fs.readFileSync(DATA_FILE))));
}

function saveKeys() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(Object.fromEntries(keys), null, 2));
}

loadKeys();

/* ================= DISCORD BOT ================= */

const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

bot.once("ready", () => {
    console.log(`Logged in as ${bot.user.tag}`);
});

bot.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith("!key")) return;
    if (!ALLOWED_USERS.includes(msg.author.id)) {
        return msg.reply("❌ No permission");
    }

    const args = msg.content.split(" ");
    const sub = args[1];

    if (sub === "add") {
        const key = args[2];
        if (!key) return msg.reply("Usage: !key add <key>");

        keys.set(key, { hwid: null });
        saveKeys();
        return msg.reply(`✅ Key added: \`${key}\``);
    }

    if (sub === "delete") {
        const key = args[2];
        if (!keys.has(key)) return msg.reply("❌ Key not found");

        keys.delete(key);
        saveKeys();
        return msg.reply(`🗑️ Key deleted: \`${key}\``);
    }

    if (sub === "list") {
        if (keys.size === 0) return msg.reply("No keys stored");

        return msg.reply(
            "**Keys:**\n" + [...keys.keys()].map(k => `\`${k}\``).join("\n")
        );
    }

    msg.reply("Commands: `!key add <key>`, `!key delete <key>`, `!key list`");
});

bot.login(BOT_TOKEN);

/* ================= AUTH SERVER ================= */

const app = express();
app.use(express.json());

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Auth server running on port", PORT);
});
