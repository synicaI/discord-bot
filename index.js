import express from "express";
import { Client, GatewayIntentBits, Partials } from "discord.js";

// ================== CONFIG ==================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const LOG_CHANNEL_ID = "1467847883456778358"; // logging channel
const ALLOWED_USERS = [
    "1001562621381714080",
    "1375016755822596096",
    "1389631531114430594",
    "1255892341206552607"
];
const AUTH_PORT = process.env.PORT || 8080;

// ================== KEYS ==================
const keys = new Map(); // { key: { hwid: string | null, expires: string | null } }

// ================== EXPRESS SERVER ==================
const app = express();
app.use(express.json());

// Roblox authentication endpoint
app.get("/v9/auth", async (req, res) => {
    const { k, hwid, experienceId } = req.query;

    if (!k || !hwid || !experienceId) return res.status(401).send("AUTH_FAIL");
    if (!keys.has(k)) return res.status(401).send("AUTH_FAIL");

    const data = keys.get(k);

    // lock HWID on first use
    if (!data.hwid) {
        data.hwid = hwid;
        keys.set(k, data);

        // log to Discord
        logToDiscord(`🔒 HWID Locked`, `Key: ${k}\nHWID: ${hwid}\nExperienceId: ${experienceId}`);
    }

    if (data.hwid !== hwid) return res.status(401).send("AUTH_FAIL");
    res.send(""); // success
});

app.listen(AUTH_PORT, () => console.log(`Auth server running on port ${AUTH_PORT}`));

// ================== DISCORD BOT ==================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

// Helper: log messages to specific channel
async function logToDiscord(title, message) {
    try {
        const channel = await client.channels.fetch(LOG_CHANNEL_ID);
        if (!channel) return;
        channel.send(`**${title}**\n${message}`);
    } catch (err) {
        console.error("Failed to log to Discord:", err);
    }
}

// Command handling
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!ALLOWED_USERS.includes(message.author.id)) return;

    const args = message.content.trim().split(/\s+/);
    const cmd = args.shift()?.toLowerCase();
    if (!cmd) return;

    if (cmd === "!key") {
        const sub = args.shift()?.toLowerCase();
        if (!sub) return message.reply("Please provide a subcommand: add, delete, list");

        if (sub === "add") {
            const key = args.shift();
            if (!key) return message.reply("Please provide a key to add");

            keys.set(key, { hwid: null, expires: null });
            message.reply(`✅ Key **${key}** added successfully`);
            logToDiscord("🔑 Key Added", `Key: ${key}\nBy: ${message.author.tag}`);
        }

        else if (sub === "delete") {
            const key = args.shift();
            if (!key) return message.reply("Please provide a key to delete");
            if (!keys.has(key)) return message.reply("❌ Key not found");

            keys.delete(key);
            message.reply(`🗑️ Key **${key}** deleted`);
            logToDiscord("🗑️ Key Deleted", `Key: ${key}\nBy: ${message.author.tag}`);
        }

        else if (sub === "list") {
            if (keys.size === 0) return message.reply("No keys available");
            const list = [...keys.entries()].map(([k, v]) => `${k} | HWID: ${v.hwid ?? "none"}`).join("\n");
            message.reply(`📜 Keys:\n${list}`);
        }

        else {
            message.reply("Unknown subcommand. Use add, delete, or list");
        }
    }
});

// ================== LOGIN ==================
client.once("ready", () => console.log(`Discord bot ready as ${client.user.tag}`));
client.login(DISCORD_TOKEN);
