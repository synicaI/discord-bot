import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const AUTH_SERVER = process.env.AUTH_SERVER.replace(/\/$/, "");
const SECRET_KEY = process.env.SECRET_KEY;
const ROLE_ID = process.env.ALLOWED_ROLE;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.member.roles.cache.has(ROLE_ID)) return;

  const args = msg.content.split(/\s+/);
  if (args[0] !== "!key") return;

  // ===== ADD KEY =====
  if (args[1] === "add") {
    const key = args[2];
    const days = args[3];

    if (!key) {
      return msg.reply("Usage: !key add <KEY> [days]");
    }

    let expires = null;
    if (days) {
      const d = parseInt(days);
      if (isNaN(d) || d <= 0) {
        return msg.reply("Days must be a positive number");
      }
      const date = new Date();
      date.setDate(date.getDate() + d);
      expires = date.toISOString().split("T")[0];
    }

    const r = await fetch(`${AUTH_SERVER}/admin/key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET_KEY, key, expires })
    });

    msg.reply(await r.text());
  }

  // ===== DELETE KEY =====
  if (args[1] === "delete") {
    const key = args[2];
    if (!key) return msg.reply("Usage: !key delete <KEY>");

    const r = await fetch(`${AUTH_SERVER}/admin/key`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: SECRET_KEY, key })
    });

    msg.reply(await r.text());
  }

  // ===== RESET HWID =====
  if (args[1] === "reset-hwid") {
    const key = args[2];
    if (!key) return msg.reply("Usage: !key reset-hwid <KEY>");

    const r = await fetch(
      `${AUTH_SERVER}/reset-hwid?k=${key}&secret=${SECRET_KEY}`
    );

    msg.reply(await r.text());
  }

  // ===== LIST =====
  if (args[1] === "list") {
    const r = await fetch(`${AUTH_SERVER}/admin/keys?secret=${SECRET_KEY}`);
    const data = await r.json();

    let out = "";
    for (const k in data) {
      out += `${k} | HWID: ${data[k].hwid || "none"} | Exp: ${data[k].expires || "lifetime"}\n`;
    }

    msg.reply("```" + (out || "No keys") + "```");
  }
});

client.login(process.env.DISCORD_TOKEN);
