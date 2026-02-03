import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// ===== CONFIG =====
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ROLE_ID = "1461424207932948728";
const BASE_URL = "https://skillful-achievement-production-f080.up.railway.app";
const SECRET_KEY = "DQOWHDIUQWHIQUWHDWQIUDHQWIUDHQWHDQWIUFHQIFQ";

// ===== CLIENT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

// ===== COMMAND HANDLER =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("!key")) return;

  // Role check
  if (!message.member.roles.cache.has(ADMIN_ROLE_ID)) {
    return message.reply("❌ You are not an admin.");
  }

  const args = message.content.trim().split(/\s+/);
  const sub = args[1];

  try {
    // ===== ADD KEY =====
    if (sub === "add") {
      const key = args[2];
      if (!key) return message.reply("Usage: !key add <key>");

      await fetch(
        `${BASE_URL}/bot/add?secret=${SECRET_KEY}&key=${encodeURIComponent(key)}`
      );

      return message.reply(`✅ Key **${key}** added.`);
    }

    // ===== LIST KEYS =====
    if (sub === "list") {
      const res = await fetch(
        `${BASE_URL}/bot/list?secret=${SECRET_KEY}`
      );

      const keys = await res.json();

      if (!keys.length) {
        return message.reply("📭 No keys found.");
      }

      return message.reply(
        "```" + keys.join("\n") + "```"
      );
    }

    // ===== HWID RESET =====
    if (sub === "hwid" && args[2] === "reset") {
      const key = args[3];
      if (!key) return message.reply("Usage: !key hwid reset <key>");

      await fetch(
        `${BASE_URL}/bot/reset?secret=${SECRET_KEY}&key=${encodeURIComponent(key)}`
      );

      return message.reply(`🔁 HWID reset for **${key}**`);
    }

    // ===== HELP =====
    return message.reply(
      "Usage:\n" +
      "`!key add <key>`\n" +
      "`!key list`\n" +
      "`!key hwid reset <key>`"
    );

  } catch (err) {
    console.error(err);
    return message.reply("❌ Bot error. Check logs.");
  }
});

// ===== LOGIN =====
client.login(BOT_TOKEN);
