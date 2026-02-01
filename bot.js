// bot.js
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// ===== CONFIG =====
const AUTH_SERVER = process.env.AUTH_SERVER.replace(/\/$/, "");
const SECRET_KEY = process.env.SECRET_KEY;
const ALLOWED_ROLE = process.env.ALLOWED_ROLE; // admin role ID

// ===== CLIENT SETUP =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// ===== COMMAND HANDLER =====
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.member.roles.cache.has(ALLOWED_ROLE)) return;

  const args = message.content.trim().split(/ +/);
  const cmd = args[0].toLowerCase();

  try {
    // ===== ADD KEY =====
    if (cmd === "!key" && args[1] === "add") {
      const key = args[2];
      const hwid = args[3] || null;
      const expires = args[4]; // required

      if (!key) return message.reply("❌ You must provide a key.");
      if (!expires) return message.reply("❌ You must provide an expiration date (YYYY-MM-DD).");

      const res = await fetch(`${AUTH_SERVER}/admin/key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET_KEY, key, hwid, expires })
      });

      const text = await res.text();
      message.channel.send(`✅ ${text}`);
    }

    // ===== DELETE KEY =====
    else if (cmd === "!key" && args[1] === "delete") {
      const key = args[2];
      if (!key) return message.reply("❌ You must provide a key.");

      const res = await fetch(`${AUTH_SERVER}/admin/key`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: SECRET_KEY, key })
      });

      const text = await res.text();
      message.channel.send(`✅ ${text}`);
    }

    // ===== RESET HWID =====
    else if (cmd === "!key" && args[1] === "reset-hwid") {
      const key = args[2];
      if (!key) return message.reply("❌ You must provide a key.");

      const res = await fetch(`${AUTH_SERVER}/reset-hwid?k=${key}&secret=${SECRET_KEY}`);
      const text = await res.text();
      message.channel.send(`✅ ${text}`);
    }

    // ===== LIST KEYS =====
    else if (cmd === "!key" && args[1] === "list") {
      const res = await fetch(`${AUTH_SERVER}/admin/keys?secret=${SECRET_KEY}`);
      const data = await res.json();

      let output = "🔑 **Keys:**\n";
      for (const k in data) {
        output += `• ${k} → HWID: ${data[k].hwid || "none"}, Expires: ${data[k].expires || "none"}\n`;
      }
      if (output.length > 1990) output = output.slice(0, 1990) + "\n…";

      message.channel.send("```" + output + "```");
    }

    // ===== HELP =====
    else if (cmd === "!help" || cmd === "!commands") {
      message.channel.send(`
🔹 **Key Management Commands**
• !key add <KEY> [HWID] <YYYY-MM-DD> → Add/update key
• !key delete <KEY> → Delete key
• !key reset-hwid <KEY> → Reset HWID
• !key list → List keys
• !help / !commands → Show this message
      `);
    }

  } catch (err) {
    console.error(err);
    message.channel.send("❌ An error occurred while processing your request.");
  }
});

// ===== LOGIN =====
client.login(process.env.DISCORD_TOKEN);
