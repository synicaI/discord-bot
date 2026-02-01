import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// ================= CONFIG =================
const BOT_TOKEN = process.env.BOT_TOKEN;
const AUTH_URL = process.env.AUTH_URL; // e.g., https://your-auth-project.up.railway.app
const SECRET_KEY = process.env.SECRET_KEY;

// ================= USER WHITELIST =================
const ALLOWED_USERS = [
  "1001562621381714080",
  "1375016755822596096",
  "1389631531114430594",
  "1255892341206552607"
];

// ================= DISCORD CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ================= HELPERS =================
async function api(path, body) {
  const res = await fetch(`${AUTH_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      secret: SECRET_KEY
    })
  });
  return res.text();
}

// ================= COMMAND HANDLER =================
client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.guild) return;
  if (!msg.content.startsWith("!key")) return;

  // 🔹 USER ID CHECK
  if (!ALLOWED_USERS.includes(msg.author.id)) {
    return msg.reply("❌ You do not have permission to use this command.");
  }

  const args = msg.content.split(" ").slice(1);
  const sub = args[0];

  // ================= !key add =================
  if (sub === "add") {
    const key = args[1];
    const days = args[2]; // optional expiration in days

    if (!key) return msg.reply("❌ Usage: `!key add <key> [days]`");

    const expires = days ? Date.now() + Number(days) * 86400000 : null;

    const result = await api("/admin/key/add", { key, expires });
    return msg.reply(`✅ ${result}`);
  }

  // ================= !key delete =================
  if (sub === "delete") {
    const key = args[1];
    if (!key) return msg.reply("❌ Usage: `!key delete <key>`");

    const result = await api("/admin/key/delete", { key });
    return msg.reply(`🗑️ ${result}`);
  }

  // ================= !key reset =================
  if (sub === "reset") {
    const key = args[1];
    if (!key) return msg.reply("❌ Usage: `!key reset <key>`");

    const result = await api("/admin/key/reset-hwid", { key });
    return msg.reply(`🔓 ${result}`);
  }

  // ================= !key list =================
  if (sub === "list") {
    const result = await api("/admin/keys", {});
    return msg.reply("```json\n" + result + "\n```");
  }

  // ================= UNKNOWN =================
  return msg.reply("❌ Unknown command.");
});

// ================= LOGIN =================
client.login(BOT_TOKEN);
