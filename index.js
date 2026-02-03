import fs from "fs";
import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

/* ================= CONFIG ================= */

const PORT = process.env.PORT || 8080;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ROLE_ID = "1461424207932948728";
const SECRET = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";
const KEY_FILE = "./keys.json";

/* ================= LOAD / SAVE ================= */

function loadKeys() {
  if (!fs.existsSync(KEY_FILE)) return {};
  return JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));
}

function saveKeys(data) {
  fs.writeFileSync(KEY_FILE, JSON.stringify(data, null, 2));
}

let keys = loadKeys();

/* ================= EXPRESS ================= */

const app = express();

app.get("/auth", (req, res) => {
  const { key, hwid, secret } = req.query;

  if (secret !== SECRET) return res.status(401).end();
  if (!key || !keys[key]) return res.status(401).end();

  if (!keys[key].hwid) {
    keys[key].hwid = hwid;
    saveKeys(keys);
    console.log(`[LOCK] ${key} → ${hwid}`);
    return res.status(200).end();
  }

  if (keys[key].hwid !== hwid) {
    return res.status(401).end();
  }

  return res.status(200).end();
});

app.listen(PORT, () => {
  console.log("Auth server running on", PORT);
});

/* ================= DISCORD BOT ================= */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("messageCreate", (msg) => {
  if (!msg.content.startsWith("!key")) return;
  if (!msg.member.roles.cache.has(ADMIN_ROLE_ID))
    return msg.reply("❌ You are not an admin");

  const [, sub, key] = msg.content.split(" ");

  if (sub === "add") {
    if (!key) return msg.reply("Usage: !key add <key>");
    keys[key] = { hwid: null };
    saveKeys(keys);
    return msg.reply(`✅ Key **${key}** added`);
  }

  if (sub === "delete") {
    if (!keys[key]) return msg.reply("❌ Key not found");
    delete keys[key];
    saveKeys(keys);
    return msg.reply(`🗑️ Key **${key}** deleted`);
  }

  if (sub === "reset") {
    if (!keys[key]) return msg.reply("❌ Key not found");
    keys[key].hwid = null;
    saveKeys(keys);
    return msg.reply(`🔓 HWID reset for **${key}**`);
  }

  if (sub === "list") {
    const list = Object.keys(keys);
    if (!list.length) return msg.reply("No keys");
    return msg.reply("**Keys:**\n" + list.join("\n"));
  }
});

client.login(BOT_TOKEN);
console.log("Discord bot logged in");
