import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// ================= CONFIG =================
const ADMIN_ROLE_ID = "1461424207932948728";
const AUTH_SERVER = "https://skillful-achievement-production-f080.up.railway.app/"; // SAME CONTAINER
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ================= CLIENT =================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ================= READY =================
client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ================= HELPERS =================
function isAdmin(member) {
  return member.roles.cache.has(ADMIN_ROLE_ID);
}

async function api(path) {
  const res = await fetch(`${AUTH_SERVER}${path}`);
  const text = await res.text(); // IMPORTANT: text, not json
  return text;
}

// ================= COMMANDS =================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!key")) return;

  if (!isAdmin(message.member)) {
    return message.reply("❌ You are not an admin.");
  }

  const args = message.content.split(" ").slice(1);
  const sub = args[0];
  const key = args[1];

  // -------- ADD --------
  if (sub === "add") {
    if (!key) return message.reply("Usage: `!key add <key>`");

    const res = await api(`/discord/add?k=${key}&secret=${SECRET_KEY}`);
    return message.reply(res || "✅ Key added.");
  }

  // -------- DELETE --------
  if (sub === "delete") {
    if (!key) return message.reply("Usage: `!key delete <key>`");

    const res = await api(`/discord/delete?k=${key}&secret=${SECRET_KEY}`);
    return message.reply(res || "🗑️ Key deleted.");
  }

  // -------- RESET HWID --------
  if (sub === "reset") {
    if (!key) return message.reply("Usage: `!key reset <key>`");

    const res = await api(`/reset-hwid?k=${key}&secret=${SECRET_KEY}`);
    return message.reply(res || "🔓 HWID reset.");
  }

  // -------- LIST --------
  if (sub === "list") {
    const res = await api(`/discord/list?secret=${SECRET_KEY}`);
    return message.reply(res || "No keys.");
  }

  return message.reply(
    "Usage:\n" +
    "`!key add <key>`\n" +
    "`!key delete <key>`\n" +
    "`!key reset <key>`\n" +
    "`!key list`"
  );
});

// ================= LOGIN =================
client.login(process.env.BOT_TOKEN);
