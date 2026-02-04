import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const AUTH_SERVER = process.env.AUTH_SERVER; // https://xxxxx.up.railway.app
const SECRET_KEY = process.env.SECRET_KEY;
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

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

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.member.roles.cache.has(ADMIN_ROLE_ID)) return;
  if (!msg.content.startsWith("!key")) return;

  const args = msg.content.split(" ");
  const sub = args[1];
  const key = args[2];

  try {
    // ADD
    if (sub === "add") {
      const r = await fetch(`${AUTH_SERVER}/key/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret": SECRET_KEY
        },
        body: JSON.stringify({ key })
      });
      if (!r.ok) throw new Error("Server error");
      msg.reply("✅ Key added");
    }

    // DELETE
    if (sub === "delete") {
      await fetch(`${AUTH_SERVER}/key/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret": SECRET_KEY
        },
        body: JSON.stringify({ key })
      });
      msg.reply("🗑️ Key deleted");
    }

    // RESET
    if (sub === "reset") {
      await fetch(`${AUTH_SERVER}/key/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-secret": SECRET_KEY
        },
        body: JSON.stringify({ key })
      });
      msg.reply("♻️ HWID reset");
    }

    // LIST
    if (sub === "list") {
      const r = await fetch(`${AUTH_SERVER}/key/list`, {
        headers: { "x-secret": SECRET_KEY }
      });
      const data = await r.json();

      if (data.keys.length === 0) {
        return msg.reply("No keys.");
      }

      const text = data.keys
        .map(k => `\`${k.key}\` — ${k.hwid ?? "UNBOUND"}`)
        .join("\n");

      msg.reply(text);
    }
  } catch (e) {
    console.error(e);
    msg.reply("❌ Error");
  }
});

client.login(BOT_TOKEN);
