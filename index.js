const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// ================= CONFIG =================
const BOT_TOKEN = process.env.BOT_TOKEN;
const PREFIX = "!";

// Allowed Discord user IDs (ADMINS)
const ADMINS = [
    "1001562621381714080",
    "1375016755822596096",
    "1389631531114430594",
    "1255892341206552607"
];

// ================= STORAGE =================
// In-memory key store (resets on restart)
const keys = new Map();

// ================= EXPRESS =================
const app = express();
app.use(express.json());

// Roblox auth
app.get("/v9/auth", (req, res) => {
    const { k, hwid, experienceId } = req.query;

    if (!k || !hwid || !experienceId) {
        return res.status(401).send("AUTH_FAIL");
    }

    if (!keys.has(k)) {
        return res.status(401).send("AUTH_FAIL");
    }

    const data = keys.get(k);

    // Lock HWID on first use
    if (data.hwid === null) {
        data.hwid = hwid;
        keys.set(k, data);
    }

    if (data.hwid !== hwid) {
        return res.status(401).send("AUTH_FAIL");
    }

    return res.status(200).send("OK");
});

// Start Express
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log("Auth server running on port", PORT);
});

// ================= DISCORD BOT =================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    if (!ADMINS.includes(message.author.id)) {
        return message.reply("❌ You do not have permission.");
    }

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const command = args.shift()?.toLowerCase();

    // !key add <key>
    if (command === "key" && args[0] === "add") {
        const key = args[1];
        if (!key) return message.reply("Usage: `!key add <key>`");

        keys.set(key, { hwid: null });
        return message.reply(`✅ Key added: \`${key}\``);
    }

    // !key remove <key>
    if (command === "key" && args[0] === "remove") {
        const key = args[1];
        if (!key) return message.reply("Usage: `!key remove <key>`");

        if (!keys.has(key)) {
            return message.reply("❌ Key not found.");
        }

        keys.delete(key);
        return message.reply(`🗑️ Key removed: \`${key}\``);
    }

    // !key list
    if (command === "key" && args[0] === "list") {
        if (keys.size === 0) {
            return message.reply("📭 No keys available.");
        }

        let text = "";
        for (const [key, data] of keys.entries()) {
            text += `• ${key} | HWID: ${data.hwid ?? "null"}\n`;
        }

        return message.reply("```" + text + "```");
    }
});

client.login(BOT_TOKEN);
