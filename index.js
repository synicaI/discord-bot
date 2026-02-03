import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

/* ================= CONFIG ================= */

const PORT = process.env.PORT || 8080;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ROLE_ID = "1461424207932948728";
const SECRET = "PUT_A_SECRET_HERE";

/* ================= KEY STORE ================= */
/*
keys = {
  "mykey123": { hwid: null }
}
*/
const keys = {};

/* ================= EXPRESS ================= */

const app = express();
app.use(express.json());

app.get("/auth", (req, res) => {
  const { key, hwid, secret } = req.query;

  if (secret !== SECRET) return res.status(401).end();
  if (!key || !keys[key]) return res.status(401).end();

  const data = keys[key];

  // first execution → lock hwid
  if (!data.hwid) {
    data.hwid = hwid;
    console.log(`[LOCK] ${key} → ${hwid}`);
    return res.status(200).end();
  }

  // hwid mismatch
  if (data.hwid !== hwid) {
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

  const args = msg.content.split(" ");
  const sub = args[1];
  const key = args[2];

  if (sub === "add") {
    if (!key) return msg.reply("Usage: !key add <key>");
    keys[key] = { hwid: null };
    return msg.reply(`✅ Key **${key}** added`);
  }

  if (sub === "delete") {
    if (!keys[key]) return msg.reply("❌ Key not found");
    delete keys[key];
    return msg.reply(`🗑️ Key **${key}** deleted`);
  }

  if (sub === "reset") {
    if (!keys[key]) return msg.reply("❌ Key not found");
    keys[key].hwid = null;
    return msg.reply(`🔓 HWID reset for **${key}**`);
  }

  if (sub === "list") {
    const list = Object.keys(keys);
    if (!list.length) return msg.reply("No keys");
    return msg.reply("**Keys:**\n" + list.join("\n"));
  }
});

client.login(BOT_TOKEN);
console.log("Discord bot starting...");
