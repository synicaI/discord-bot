import express from "express";
import dotenv from "dotenv";
import fs from "fs";
import { Client, GatewayIntentBits } from "discord.js";

dotenv.config();

// ================== CONFIG ==================
const app = express();
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.SECRET_KEY;
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const KEYS_FILE = "./keys.json";

// ================== KEYS STORAGE ==================
let keys = {};
if (fs.existsSync(KEYS_FILE)) {
    keys = JSON.parse(fs.readFileSync(KEYS_FILE, "utf8"));
}

function saveKeys() {
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

// ================== AUTH ROUTE (ROBLOX) ==================
app.get("/v9/auth", (req, res) => {
    const { SECRET_KEY: secret, k, hwid } = req.query;

    if (secret !== SECRET_KEY) return res.sendStatus(401);

    const keyData = keys[k];
    if (!keyData) return res.sendStatus(401);

    if (keyData.expires && Date.now() > keyData.expires) {
        return res.sendStatus(403);
    }

    if (!keyData.hwid) {
        keyData.hwid = hwid;
        saveKeys();
        return res.sendStatus(200);
    }

    if (keyData.hwid !== hwid) {
        return res.sendStatus(403);
    }

    return res.sendStatus(200);
});

// ================== START AUTH SERVER ==================
app.listen(PORT);

// ================== DISCORD BOT ==================
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {});

// ================== COMMAND HANDLER ==================
client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;
    if (!msg.content.startsWith("!key")) return;

    const member = msg.member;
    if (!member.roles.cache.has(ADMIN_ROLE_ID)) {
        return msg.reply("❌ You do not have permission.");
    }

    const args = msg.content.split(" ").slice(1);
    const sub = args.shift();

    // !key add <key> [days]
    if (sub === "add") {
        const key = args[0];
        const days = args[1];

        if (!key) return msg.reply("❌ Provide a key.");

        let expires = null;
        if (days) {
            expires = Date.now() + parseInt(days) * 86400000;
        }

        keys[key] = { hwid: null, expires };
        saveKeys();

        return msg.reply(`✅ Key **${key}** added.`);
    }

    // !key delete <key>
    if (sub === "delete") {
        const key = args[0];
        if (!keys[key]) return msg.reply("❌ Key not found.");

        delete keys[key];
        saveKeys();

        return msg.reply(`✅ Key **${key}** deleted.`);
    }

    // !key reset-hwid <key>
    if (sub === "reset-hwid") {
        const key = args[0];
        if (!keys[key]) return msg.reply("❌ Key not found.");

        keys[key].hwid = null;
        saveKeys();

        return msg.reply(`✅ HWID reset for **${key}**.`);
    }

    // !key list
    if (sub === "list") {
        if (Object.keys(keys).length === 0) {
            return msg.reply("No keys.");
        }

        let text = "";
        for (const k in keys) {
            const hwid = keys[k].hwid ?? "null";
            const exp = keys[k].expires
                ? new Date(keys[k].expires).toLocaleString()
                : "lifetime";
            text += `• ${k} | HWID: ${hwid} | Exp: ${exp}\n`;
        }

        return msg.reply("```\n" + text + "```");
    }

    msg.reply("❌ Unknown command.");
});

// ================== LOGIN ==================
client.login(process.env.DISCORD_TOKEN);
